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

    # Rating fields (for catalysts)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, help_text="Average rating out of 5")
    rating_count = models.PositiveIntegerField(default=0, help_text="Total number of ratings")

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

class Rating(models.Model):
    """
    Rating given by a seeker to a catalyst after a booking.
    """
    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_given')
    catalyst = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_received')
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='rating', null=True, blank=True)
    rating = models.PositiveSmallIntegerField(help_text="Rating from 1-5 stars")
    review = models.TextField(blank=True, help_text="Optional written review")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('seeker', 'catalyst', 'booking')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.seeker.username} rated {self.catalyst.username}: {self.rating}/5"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update catalyst's average rating
        self.update_catalyst_rating()

    def delete(self, *args, **kwargs):
        catalyst = self.catalyst
        super().delete(*args, **kwargs)
        # Update catalyst's average rating after deletion
        self.update_catalyst_rating_for_user(catalyst)

    def update_catalyst_rating(self):
        """Update the catalyst's average rating and count"""
        try:
            catalyst_profile = self.catalyst.profile
        except Exception:
            # Profile might be deleted or user is being deleted
            return

        ratings = Rating.objects.filter(catalyst=self.catalyst)
        count = ratings.count()
        if count > 0:
            avg = sum(r.rating for r in ratings) / count
            catalyst_profile.average_rating = round(avg, 2)
            catalyst_profile.rating_count = count
        else:
            catalyst_profile.average_rating = 0.00
            catalyst_profile.rating_count = 0
        catalyst_profile.save()

    @staticmethod
    def update_catalyst_rating_for_user(catalyst):
        """Update a specific catalyst's rating"""
        try:
            catalyst_profile = catalyst.profile
        except Exception:
            # Profile might be deleted or user is being deleted
            return

        ratings = Rating.objects.filter(catalyst=catalyst)
        count = ratings.count()
        if count > 0:
            avg = sum(r.rating for r in ratings) / count
            catalyst_profile.average_rating = round(avg, 2)
            catalyst_profile.rating_count = count
        else:
            catalyst_profile.average_rating = 0.00
            catalyst_profile.rating_count = 0
        catalyst_profile.save()

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

class Report(models.Model):
    """
    Model to store user reports against other users.
    """
    REPORT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    )

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_filed')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=REPORT_STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report by {self.reporter.username} against {self.reported_user.username}"
