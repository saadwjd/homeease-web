from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Provider, Booking, Review, ServiceCategory, ContactMessage


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'name']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'phone', 'role', 'avatar', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'hourly_rate', 'rating', 'is_available', 'is_verified']
    list_filter = ['is_available', 'is_verified', 'city']
    search_fields = ['user__name', 'user__email']
    actions = ['verify_providers']

    def verify_providers(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, f'{queryset.count()} providers verified.')
    verify_providers.short_description = 'Mark selected as verified'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'provider', 'service', 'status', 'scheduled_date', 'total_amount']
    list_filter = ['status', 'payment_method']
    search_fields = ['user__name', 'provider__user__name']
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'provider', 'rating', 'created_at']
    list_filter = ['rating']


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at', 'is_read']
    list_filter = ['is_read']
