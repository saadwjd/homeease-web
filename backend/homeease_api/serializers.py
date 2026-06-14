from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Provider, Booking, Review, ServiceCategory, ContactMessage


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.ReadOnlyField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'role', 'avatar', 'avatar_url',
                  'address', 'date_joined', 'password']
        read_only_fields = ['date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'phone', 'password', 'confirm_password', 'role']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled')
        data['user'] = user
        return data


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'


class ProviderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = ServiceCategorySerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=ServiceCategory.objects.all(),
        write_only=True, source='skills', required=False
    )

    class Meta:
        model = Provider
        fields = ['id', 'user', 'bio', 'skills', 'skill_ids', 'hourly_rate',
                  'experience_years', 'is_available', 'is_verified', 'city',
                  'address', 'rating', 'review_count', 'gender', 'age',
                  'cnic', 'created_at']
        read_only_fields = ['rating', 'review_count', 'is_verified']


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    provider_detail = ProviderSerializer(source='provider', read_only=True)
    service_detail = ServiceCategorySerializer(source='service', read_only=True)
    provider = serializers.PrimaryKeyRelatedField(queryset=Provider.objects.all())
    service = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Booking
        fields = ['id', 'user', 'provider', 'provider_detail', 'service',
                  'service_detail', 'status', 'payment_method', 'scheduled_date',
                  'scheduled_time', 'address', 'notes', 'total_amount',
                  'is_reviewed', 'created_at', 'updated_at']
        read_only_fields = ['user', 'is_reviewed', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'booking', 'user', 'provider', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        booking = validated_data['booking']
        booking.is_reviewed = True
        booking.save()
        return super().create(validated_data)


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']
