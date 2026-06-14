from django.core.management.base import BaseCommand
from homeease_api.models import User, Provider, ServiceCategory, Booking, Review
from django.utils import timezone
import datetime


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Service Categories
        services_data = [
            ('Plumbing', '🔧'),
            ('Electrical', '⚡'),
            ('Cleaning', '🧹'),
            ('Painting', '🎨'),
            ('Carpentry', '🪵'),
            ('AC Repair', '❄️'),
            ('Gardening', '🌿'),
            ('Security', '🛡️'),
            ('Masonry', '🧱'),
            ('Welding', '🔩'),
        ]
        services = []
        for name, icon in services_data:
            s, _ = ServiceCategory.objects.get_or_create(name=name, defaults={'icon': icon})
            services.append(s)
        self.stdout.write(f'  ✓ Created {len(services)} service categories')

        # Admin user
        admin, _ = User.objects.get_or_create(
            email='admin@homeease.pk',
            defaults={'name': 'Admin', 'role': 'admin', 'is_staff': True, 'is_superuser': True}
        )
        if _:
            admin.set_password('admin123')
            admin.save()

        # Sample customers
        customers = []
        customer_data = [
            ('ali@example.com', 'Ali Hassan', '+92 300 1234567'),
            ('sara@example.com', 'Sara Khan', '+92 301 2345678'),
            ('ahmed@example.com', 'Ahmed Raza', '+92 302 3456789'),
        ]
        for email, name, phone in customer_data:
            u, created = User.objects.get_or_create(
                email=email,
                defaults={'name': name, 'phone': phone, 'role': 'user'}
            )
            if created:
                u.set_password('password123')
                u.save()
            customers.append(u)
        self.stdout.write(f'  ✓ Created {len(customers)} customers')

        # Sample providers
        providers_data = [
            ('ahmad@provider.com', 'Muhammad Ahmad', '+92 310 1111111', 'Plumber with 5 years experience', 800, 5, [0], 4.9, 127),
            ('bilal@provider.com', 'Bilal Khan', '+92 311 2222222', 'Certified electrician and AC specialist', 1000, 7, [1, 5], 4.8, 89),
            ('fahad@provider.com', 'Fahad Malik', '+92 312 3333333', 'Professional house painter interior & exterior', 700, 4, [3], 4.7, 65),
            ('usman@provider.com', 'Usman Ali', '+92 313 4444444', 'Deep cleaning and regular housekeeping', 600, 3, [2], 4.6, 112),
            ('tariq@provider.com', 'Tariq Mehmood', '+92 314 5555555', 'Custom carpentry and furniture repair', 900, 6, [4], 4.8, 54),
            ('hassan@provider.com', 'Hassan Raza', '+92 315 6666666', 'Lawn care, trimming and landscaping', 500, 2, [6], 4.5, 38),
        ]

        created_providers = []
        for email, name, phone, bio, rate, exp, skill_indices, rating, reviews in providers_data:
            u, created = User.objects.get_or_create(
                email=email,
                defaults={'name': name, 'phone': phone, 'role': 'provider'}
            )
            if created:
                u.set_password('password123')
                u.save()

            p, _ = Provider.objects.get_or_create(
                user=u,
                defaults={
                    'bio': bio,
                    'hourly_rate': rate,
                    'experience_years': exp,
                    'rating': rating,
                    'review_count': reviews,
                    'is_verified': True,
                    'is_available': True,
                    'city': 'Lahore',
                    'gender': 'Male',
                    'age': 30 + exp,
                }
            )
            for idx in skill_indices:
                p.skills.add(services[idx])
            created_providers.append(p)

        self.stdout.write(f'  ✓ Created {len(created_providers)} providers')

        # Sample bookings
        if customers and created_providers:
            booking, created = Booking.objects.get_or_create(
                user=customers[0],
                provider=created_providers[0],
                defaults={
                    'service': services[0],
                    'status': 'completed',
                    'payment_method': 'cash',
                    'scheduled_date': datetime.date.today() - datetime.timedelta(days=5),
                    'scheduled_time': datetime.time(11, 0),
                    'address': 'DHA Phase 5, Lahore',
                    'total_amount': 800,
                    'is_reviewed': True,
                }
            )
            if created:
                Review.objects.get_or_create(
                    booking=booking,
                    defaults={
                        'user': customers[0],
                        'provider': created_providers[0],
                        'rating': 5,
                        'comment': 'Excellent work! Fixed our pipe leak quickly and professionally.'
                    }
                )

        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully!'))
        self.stdout.write('')
        self.stdout.write('Test accounts:')
        self.stdout.write('  Admin:    admin@homeease.pk / admin123')
        self.stdout.write('  Customer: ali@example.com / password123')
        self.stdout.write('  Provider: ahmad@provider.com / password123')
