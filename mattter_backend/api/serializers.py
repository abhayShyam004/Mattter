from rest_framework import serializers
from .models import User, Profile, WardrobeItem, Service, Booking, Message, Rating
# from rest_framework_gis.serializers import GeoFeatureModelSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserWithProfileSerializer(serializers.ModelSerializer):
    """User serializer that includes profile data for displaying in bookings"""
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                'id': profile.id,
                'role': profile.role,
                'gender': profile.gender,
                'age': profile.age,
                'bio': profile.bio,
                'bio_short': profile.bio_short,
                'address': profile.address,
                'latitude': profile.latitude,
                'longitude': profile.longitude,
                'hourly_rate': str(profile.hourly_rate) if profile.hourly_rate else None,
                'specializations': profile.specializations,
                'portfolio_images': profile.portfolio_images,
                'is_active': profile.is_active,
                'style_goals': profile.style_goals,
                'preferences': profile.preferences,
                'average_rating': str(profile.average_rating),
                'rating_count': profile.rating_count,
            }
        except Profile.DoesNotExist:
            return None

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'role', 'gender', 'age', 'bio', 'bio_short', 'is_active',
            'latitude', 'longitude', 'address',
            'hourly_rate', 'specializations', 'portfolio_images',
            'style_goals', 'preferences', 'average_rating', 'rating_count'
        ]
        read_only_fields = ['id', 'user', 'average_rating', 'rating_count']

class WardrobeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WardrobeItem
        fields = '__all__'
        read_only_fields = ['owner', 'ai_tags']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['catalyst']

class BookingSerializer(serializers.ModelSerializer):
    # For reading: return nested user objects with profile data
    seeker = UserWithProfileSerializer(read_only=True)
    catalyst = UserWithProfileSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    
    # For writing: accept IDs
    catalyst_id = serializers.IntegerField(write_only=True, required=True)
    seeker_id = serializers.IntegerField(write_only=True, required=False)
    service_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['seeker', 'catalyst', 'service', 'status']
    
    def create(self, validated_data):
        # Extract the IDs
        catalyst_id = validated_data.pop('catalyst_id')
        seeker_id = validated_data.pop('seeker_id', None)
        service_id = validated_data.pop('service_id', None)
        
        # Use seeker from context if not provided
        if not seeker_id:
            seeker_id = self.context['request'].user.id
        
        # Create the booking with the IDs
        booking = Booking.objects.create(
            catalyst_id=catalyst_id,
            seeker_id=seeker_id,
            service_id=service_id,
            **validated_data
        )
        return booking

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Message
        fields = ['id', 'booking', 'sender', 'sender_id', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']
    
    def create(self, validated_data):
        # Use sender from context if not provided
        sender_id = validated_data.pop('sender_id', None)
        if not sender_id:
            sender_id = self.context['request'].user.id
        
        message = Message.objects.create(
            sender_id=sender_id,
            **validated_data
        )
        return message

class RatingSerializer(serializers.ModelSerializer):
    seeker = UserSerializer(read_only=True)
    catalyst = UserSerializer(read_only=True)
    seeker_id = serializers.IntegerField(write_only=True, required=False)
    catalyst_id = serializers.IntegerField(write_only=True, required=True)
    booking_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'seeker', 'catalyst', 'seeker_id', 'catalyst_id', 'booking', 'booking_id', 
                  'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['seeker', 'catalyst', 'booking', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Use seeker from context if not provided
        seeker_id = validated_data.pop('seeker_id', None)
        if not seeker_id:
            seeker_id = self.context['request'].user.id
        
        catalyst_id = validated_data.pop('catalyst_id')
        booking_id = validated_data.pop('booking_id', None)
        
        rating = Rating.objects.create(
            seeker_id=seeker_id,
            catalyst_id=catalyst_id,
            booking_id=booking_id,
            **validated_data
        )
        return rating

