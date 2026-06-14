from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from .models import User, Provider, Booking, Review, ServiceCategory, ContactMessage
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ProviderSerializer, BookingSerializer, ReviewSerializer,
    ServiceCategorySerializer, ContactMessageSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Auto-create provider profile if role is provider
            if user.role == 'provider':
                Provider.objects.create(user=user)
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': 'Account created successfully!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': 'Login successful!'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'message': 'Logged out'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


class ProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.filter(is_available=True).select_related('user')
    serializer_class = ProviderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_available', 'is_verified', 'city']
    search_fields = ['user__name', 'bio', 'skills__name', 'city']
    ordering_fields = ['rating', 'hourly_rate', 'review_count', 'created_at']
    ordering = ['-rating']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Provider.objects.all().select_related('user').prefetch_related('skills')
        skill = self.request.query_params.get('skill')
        if skill:
            queryset = queryset.filter(skills__name__icontains=skill)
        min_rate = self.request.query_params.get('min_rate')
        max_rate = self.request.query_params.get('max_rate')
        if min_rate:
            queryset = queryset.filter(hourly_rate__gte=min_rate)
        if max_rate:
            queryset = queryset.filter(hourly_rate__lte=max_rate)
        return queryset

    @action(detail=False, methods=['get', 'put', 'patch'],
            permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            provider = Provider.objects.get(user=request.user)
        except Provider.DoesNotExist:
            return Response({'error': 'Provider profile not found'}, status=404)

        if request.method == 'GET':
            return Response(ProviderSerializer(provider).data)

        serializer = ProviderSerializer(provider, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        provider = self.get_object()
        reviews = provider.reviews.all()
        return Response(ReviewSerializer(reviews, many=True).data)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Booking.objects.all()
        if user.role == 'provider':
            try:
                provider = Provider.objects.get(user=user)
                return Booking.objects.filter(provider=provider)
            except Provider.DoesNotExist:
                return Booking.objects.none()
        return Booking.objects.filter(user=user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=400)
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ['completed', 'cancelled']:
            return Response({'error': f'Cannot cancel a {booking.status} booking'}, status=400)
        booking.status = 'cancelled'
        booking.save()
        return Response({'message': 'Booking cancelled', 'booking': BookingSerializer(booking).data})


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all()
        provider_id = self.request.query_params.get('provider')
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)
        return queryset


class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Message sent successfully! We will get back to you within 24 hours.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'admin':
            return Response({
                'total_users': User.objects.filter(role='user').count(),
                'total_providers': Provider.objects.count(),
                'total_bookings': Booking.objects.count(),
                'pending_bookings': Booking.objects.filter(status='pending').count(),
                'completed_bookings': Booking.objects.filter(status='completed').count(),
                'total_reviews': Review.objects.count(),
            })
        elif user.role == 'provider':
            try:
                provider = Provider.objects.get(user=user)
                bookings = Booking.objects.filter(provider=provider)
                return Response({
                    'total_bookings': bookings.count(),
                    'pending': bookings.filter(status='pending').count(),
                    'confirmed': bookings.filter(status='confirmed').count(),
                    'completed': bookings.filter(status='completed').count(),
                    'rating': provider.rating,
                    'review_count': provider.review_count,
                })
            except Provider.DoesNotExist:
                return Response({})
        else:
            bookings = Booking.objects.filter(user=user)
            return Response({
                'total_bookings': bookings.count(),
                'pending': bookings.filter(status='pending').count(),
                'completed': bookings.filter(status='completed').count(),
                'cancelled': bookings.filter(status='cancelled').count(),
            })
