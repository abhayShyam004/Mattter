from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.contrib.gis.db import models as gis_models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model to allow for future extensibility.
    """
    pass

class Profile(models.Model):
    """
    Profile model extending User with role-specific fields.
    """
    ROLE_CHOICES = [
        ('SEEKER', 'Seeker'),
        ('CATALYST', 'Catalyst'),
    ]
    
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHERS', 'Others'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='SEEKER')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    bio = models.TextField(blank=True)
    
    # Catalyst-specific fields
    is_active = models.BooleanField(default=True, help_text="Whether catalyst is currently accepting requests")
    bio_short = models.CharField(max_length=200, blank=True, help_text="Short bio/tagline")
    
    # Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.TextField(blank=True)
    
    # Catalyst pricing and services
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    specializations = models.JSONField(default=list, blank=True)
    portfolio_images = models.JSONField(default=list, blank=True)
    
    # Seeker preferences
    style_goals = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class WardrobeItem(models.Model):
    """
    Represents a clothing item in a seeker's virtual wardrobe.
    """
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wardrobe_items')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, help_text="e.g., Top, Bottom, Shoes")
    color = models.CharField(max_length=50, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='wardrobe/', blank=True, null=True)
    
    # AI Tagging placeholders
    ai_tags = models.JSONField(default=dict, blank=True, help_text="Auto-generated tags")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

class Service(models.Model):
    """
    Service packages offered by catalysts.
    """
    catalyst = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(help_text="Duration in minutes")

    def __str__(self):
        return f"{self.name} by {self.catalyst.username}"

class Booking(models.Model):
    """
    Booking of a service by a seeker with a catalyst.
    """
    STATUS_CHOICES = (
        ('REQUESTED', 'Requested'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_seeker')
    catalyst = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_catalyst')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    scheduled_time = models.DateTimeField()
    notes = models.TextField(blank=True)
    seeker_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking: {self.seeker.username} with {self.catalyst.username} ({self.status})"

class Message(models.Model):
    """
    Messages between catalyst and seeker for a booking.
    Messages auto-delete after 1 week.
    """
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"
