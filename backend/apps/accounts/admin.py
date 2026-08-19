from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address

class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'role', 'is_active', 'email_verified', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone_number', 'profile_picture', 'date_of_birth', 'email_verified')}),
    )

admin.site.register(User, UserAdmin)
admin.site.register(Address)
