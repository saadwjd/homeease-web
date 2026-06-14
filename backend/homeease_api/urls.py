from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('providers', views.ProviderViewSet, basename='provider')
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('reviews', views.ReviewViewSet, basename='review')
router.register('services', views.ServiceCategoryViewSet, basename='service')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),

    # Dashboard
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard'),

    # Contact
    path('contact/', views.ContactView.as_view(), name='contact'),

    # Router URLs
    path('', include(router.urls)),
]
