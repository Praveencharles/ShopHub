import os

from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create a superuser if none exists (safe for repeated deploys)."

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING("Superuser already exists, skipping."))
            return

        email = os.environ.get("ADMIN_EMAIL", "admin@shophub.com")
        username = os.environ.get("ADMIN_USERNAME", "admin")
        password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")

        User.objects.create_superuser(
            email=email,
            username=username,
            password=password,
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Superuser created: {email}"))
