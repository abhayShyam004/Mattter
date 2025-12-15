from django.db import migrations
from django.contrib.auth.hashers import make_password

from django.db import migrations
from django.contrib.auth.hashers import make_password
import os

def create_admin_user(apps, schema_editor):
    User = apps.get_model('api', 'User')
    
    # Fetch from environment
    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_email or not admin_password:
        print("WARNING: ADMIN_EMAIL or ADMIN_PASSWORD not found in environment. Skipping admin creation.")
        return

    if not User.objects.filter(username=admin_email).exists():
        User.objects.create(
            username=admin_email,
            email=admin_email,
            password=make_password(admin_password),
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print(f"Admin user {admin_email} created via migration.")
    else:
        # Ensure existing user has admin rights
        user = User.objects.get(username=admin_email)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        print(f"Admin user {admin_email} updated via migration.")

def reverse_admin_user(apps, schema_editor):
    User = apps.get_model('api', 'User')
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@mattter.com')
    User.objects.filter(username=admin_email).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_profile_average_rating_profile_rating_count_rating'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_admin_user),
    ]
