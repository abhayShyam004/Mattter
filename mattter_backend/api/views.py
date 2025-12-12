from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
# from django.contrib.gis.geos import Point
# from django.contrib.gis.db.models.functions import Distance
from .models import User, Profile, WardrobeItem, Service, Booking, Message
from .serializers import (
    UserSerializer, ProfileSerializer, WardrobeItemSerializer, 
    ServiceSerializer, BookingSerializer, MessageSerializer
)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['specializations', 'bio']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Location-based filtering using Haversine formula
        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        radius = float(self.request.query_params.get('radius', 10000))  # Default 10km in meters
        
        if lat and lon:
            from math import radians, sin, cos, sqrt, atan2
            
            user_lat = float(lat)
            user_lon = float(lon)
            
            # Filter profiles with location data
            profiles_with_location = queryset.exclude(latitude__isnull=True).exclude(longitude__isnull=True)
            
            # Calculate distance for each profile and filter
            nearby_profiles = []
            for profile in profiles_with_location:
                # Haversine formula
                R = 6371000  # Earth's radius in meters
                
                lat1 = radians(user_lat)
                lon1 = radians(user_lon)
                lat2 = radians(profile.latitude)
                lon2 = radians(profile.longitude)
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                distance = R * c
                
                if distance <= radius:
                    profile.distance = round(distance)  # Store distance for ordering
                    nearby_profiles.append(profile.id)
            
            queryset = queryset.filter(id__in=nearby_profiles)
        
        # Role filtering
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
            
        return queryset

    @action(detail=False, methods=['GET', 'PATCH'])
    def me(self, request):
        if request.user.is_authenticated:
            profile, created = Profile.objects.get_or_create(user=request.user)
            
            if request.method == 'PATCH':
                serializer = self.get_serializer(profile, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
        return Response({"detail": "Not authenticated"}, status=401)

    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def nearby_catalysts(self, request):
        """
        Get nearby catalysts based on user location.
        Query params: lat, lon, radius (optional, default 10000 meters)
        """
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        
        if not lat or not lon:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from math import radians, sin, cos, sqrt, atan2
            
            user_lat = float(lat)
            user_lon = float(lon)
            radius = float(request.query_params.get('radius', 10000))  # Default 10km
            
            # Get only catalysts with location data
            catalysts = Profile.objects.filter(
                role='CATALYST',
                latitude__isnull=False,
                longitude__isnull=False
            )
            
            # Calculate distance for each catalyst and filter by radius
            nearby_catalysts = []
            for catalyst in catalysts:
                # Haversine formula
                R = 6371000  # Earth's radius in meters
                
                lat1 = radians(user_lat)
                lon1 = radians(user_lon)
                lat2 = radians(catalyst.latitude)
                lon2 = radians(catalyst.longitude)
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                distance = R * c
                
                if distance <= radius:
                    nearby_catalysts.append({
                        'id': catalyst.id,
                        'name': catalyst.user.get_full_name() or catalyst.user.username,
                        'username': catalyst.user.username,
                        'bio': catalyst.bio,
                        'latitude': catalyst.latitude,
                        'longitude': catalyst.longitude,
                        'specializations': catalyst.specializations,
                        'hourly_rate': str(catalyst.hourly_rate) if catalyst.hourly_rate else None,
                        'distance': round(distance)  # Distance in meters
                    })
            
            # Sort by distance
            nearby_catalysts.sort(key=lambda x: x['distance'])
            
            return Response({
                'success': True,
                'count': len(nearby_catalysts),
                'catalysts': nearby_catalysts
            })
            
        except ValueError as e:
            return Response(
                {"error": f"Invalid latitude or longitude: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['GET'], permission_classes=[permissions.IsAuthenticated])
    def get_preferences(self, request):
        """
        Retrieve seeker preferences for the authenticated user.
        Returns default values if preferences haven't been set.
        """
        try:
            profile = Profile.objects.get(user=request.user)
            
            # Get preferences or return defaults
            preferences = profile.preferences if profile.preferences else {
                'consultation_type': [],
                'service_scope': '',
                'services_selected': [],
                'budget_catalyst': '',
                'budget_personal': ''
            }
            
            return Response({
                'success': True,
                'preferences': preferences
            })
            
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['PUT', 'PATCH'], permission_classes=[permissions.IsAuthenticated])
    def update_preferences(self, request):
        """
        Update seeker preferences for the authenticated user.
        Expected payload:
        {
            "consultation_type": ["physical", "online"],
            "service_scope": "complete_rebranding" or "wardrobe_only",
            "services_selected": ["body_fitness", "hair", "skincare", "nails", "hygiene", "wardrobe"],
            "budget_catalyst": "free", "200-500", "500-1000", etc.
            "budget_personal": "200-1000", "1000-3000", etc.
        }
        """
        try:
            profile = Profile.objects.get(user=request.user)
            
            # Validate and update preferences
            preferences = request.data
            
            # Basic validation
            valid_consultation_types = ['physical', 'online']
            valid_service_scopes = ['complete_rebranding', 'wardrobe_only']
            valid_services = ['body_fitness', 'hair', 'skincare', 'nails', 'hygiene', 'wardrobe']
            valid_catalyst_budgets = ['free', '200-500', '500-1000', '1000-2000', '2000-5000', '5000+']
            valid_personal_budgets = ['200-1000', '1000-3000', '3000-5000', '5000-10000', '10000+']
            
            # Validate consultation_type
            if 'consultation_type' in preferences:
                if not isinstance(preferences['consultation_type'], list):
                    return Response(
                        {"error": "consultation_type must be a list"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if not all(ct in valid_consultation_types for ct in preferences['consultation_type']):
                    return Response(
                        {"error": f"Invalid consultation_type. Must be one or more of: {valid_consultation_types}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate service_scope
            if 'service_scope' in preferences:
                if preferences['service_scope'] not in valid_service_scopes:
                    return Response(
                        {"error": f"Invalid service_scope. Must be one of: {valid_service_scopes}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate services_selected
            if 'services_selected' in preferences:
                if not isinstance(preferences['services_selected'], list):
                    return Response(
                        {"error": "services_selected must be a list"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if not all(s in valid_services for s in preferences['services_selected']):
                    return Response(
                        {"error": f"Invalid services. Must be one or more of: {valid_services}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate budgets
            if 'budget_catalyst' in preferences and preferences['budget_catalyst'] not in valid_catalyst_budgets:
                return Response(
                    {"error": f"Invalid budget_catalyst. Must be one of: {valid_catalyst_budgets}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if 'budget_personal' in preferences and preferences['budget_personal'] not in valid_personal_budgets:
                return Response(
                    {"error": f"Invalid budget_personal. Must be one of: {valid_personal_budgets}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update preferences
            profile.preferences = preferences
            profile.save()
            
            return Response({
                "success": True,
                "message": "Preferences saved successfully",
                "preferences": profile.preferences
            })
            
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WardrobeItemViewSet(viewsets.ModelViewSet):
    serializer_class = WardrobeItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WardrobeItem.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(catalyst=self.request.user)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = None
        
        if hasattr(user, 'profile') and user.profile.role == 'CATALYST':
            queryset = Booking.objects.filter(catalyst=user)
        else:
            queryset = Booking.objects.filter(seeker=user)
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            # Support comma-separated statuses (e.g., "CONFIRMED,COMPLETED")
            statuses = [s.strip() for s in status_param.split(',')]
            queryset = queryset.filter(status__in=statuses)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user)
    
    @action(detail=True, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def accept_request(self, request, pk=None):
        """
        Accept a booking request (catalyst only).
        Changes status from REQUESTED to CONFIRMED.
        """
        booking = self.get_object()
        
        # Ensure the user is the catalyst for this booking
        if booking.catalyst != request.user:
            return Response(
                {"error": "You are not authorized to accept this booking"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Ensure booking is in REQUESTED status
        if booking.status != 'REQUESTED':
            return Response(
                {"error": f"Cannot accept booking with status {booking.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to CONFIRMED
        booking.status = 'CONFIRMED'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response({
            "success": True,
            "message": "Booking request accepted",
            "booking": serializer.data
        })
    
    @action(detail=True, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def reject_request(self, request, pk=None):
        """
        Reject a booking request (catalyst only).
        Changes status from REQUESTED to CANCELLED.
        """
        booking = self.get_object()
        
        # Ensure the user is the catalyst for this booking
        if booking.catalyst != request.user:
            return Response(
                {"error": "You are not authorized to reject this booking"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Ensure booking is in REQUESTED status
        if booking.status != 'REQUESTED':
            return Response(
                {"error": f"Cannot reject booking with status {booking.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to CANCELLED
        booking.status = 'CANCELLED'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response({
            "success": True,
            "message": "Booking request rejected",
            "booking": serializer.data
        })
    
    @action(detail=True, methods=['DELETE'], permission_classes=[permissions.IsAuthenticated])
    def delete_booking(self, request, pk=None):
        """
        Delete/Cancel a confirmed or completed booking (catalyst only).
        Marks the booking as CANCELLED to remove it from the matched seekers list.
        """
        booking = self.get_object()
        
        # Ensure the user is the catalyst for this booking
        if booking.catalyst != request.user:
            return Response(
                {"error": "You are not authorized to delete this booking"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow deleting CONFIRMED or COMPLETED bookings
        if booking.status not in ['CONFIRMED', 'COMPLETED']:
            return Response(
                {"error": f"Cannot delete booking with status {booking.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as CANCELLED instead of deleting from database
        booking.status = 'CANCELLED'
        booking.save()
        
        return Response({
            "success": True,
            "message": "Booking removed successfully"
        })

class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for messages between catalyst and seeker.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return messages for bookings where the user is either catalyst or seeker.
        Filter by booking_id if provided.
        """
        user = self.request.user
        queryset = Message.objects.filter(
            booking__seeker=user
        ) | Message.objects.filter(
            booking__catalyst=user
        )
        
        # Filter by booking if provided
        booking_id = self.request.query_params.get('booking_id')
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
        
        return queryset.distinct()

    def perform_create(self, serializer):
        """
        Automatically set the sender to the current user.
        """
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def mark_as_read(self, request):
        """
        Mark messages as read for a specific booking.
        """
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {"error": "booking_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all unread messages for this booking where user is the receiver
        messages = Message.objects.filter(
            booking_id=booking_id,
            is_read=False
        ).exclude(sender=request.user)
        
        # Mark them as read
        count = messages.update(is_read=True)
        
        return Response({
            "success": True,
            "marked_read": count
        })

