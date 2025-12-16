from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
# from django.contrib.gis.geos import Point
# from django.contrib.gis.db.models.functions import Distance
from django.utils import timezone
from .models import User, Profile, WardrobeItem, Service, Booking, Message, Rating, Report
from .serializers import (
    UserSerializer, ProfileSerializer, WardrobeItemSerializer, 
    ServiceSerializer, BookingSerializer, MessageSerializer, RatingSerializer,
    ReportSerializer
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

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to optimize single profile fetches"""
        profile = Profile.objects.select_related('user').get(pk=kwargs['pk'])
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'], permission_classes=[permissions.AllowAny], url_path='catalyst_view')
    def catalyst_view(self, request, pk=None):
        """Ultra-optimized endpoint for viewing catalyst profiles - bypasses slow serializers"""
        try:
            profile = Profile.objects.select_related('user').only(
                'id', 'role', 'gender', 'age', 'bio', 'bio_short', 'address',
                'latitude', 'longitude', 'hourly_rate', 'specializations',
                'average_rating', 'rating_count', 'portfolio_images',
                'user__id', 'user__username', 'user__email', 'user__first_name', 'user__last_name'
            ).get(pk=pk)
            
            # Manual dict construction - super fast
            data = {
                'id': profile.id,
                'user': {
                    'id': profile.user.id,
                    'username': profile.user.username,
                    'email': profile.user.email,
                    'first_name': profile.user.first_name,
                    'last_name': profile.user.last_name,
                },
                'role': profile.role,
                'gender': profile.gender,
                'age': profile.age,
                'bio': profile.bio,
                'bio_short': profile.bio_short,
                'address': profile.address,
                'latitude': profile.latitude,
                'longitude': profile.longitude,
                'hourly_rate': str(profile.hourly_rate) if profile.hourly_rate else None,
                'specializations': profile.specializations or [],
                'average_rating': float(profile.average_rating),
                'rating_count': profile.rating_count,
                'portfolio_images': profile.portfolio_images or [],  # Include images directly
                'is_active': profile.is_active,
            }
            
            return Response(data)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['GET'], permission_classes=[permissions.AllowAny])
    def portfolio_images(self, request, pk=None):
        """Separate endpoint for lazy-loading portfolio images"""
        try:
            profile = Profile.objects.only('id', 'portfolio_images').get(pk=pk)
            return Response({'portfolio_images': profile.portfolio_images or []})
        except Profile.DoesNotExist:
            return Response({'portfolio_images': []}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET', 'PATCH'])
    def me(self, request):
        if request.user.is_authenticated:
            from django.core.cache import cache
            cache_key = f'profile_me_{request.user.id}'
            
            # Use cached profile for GET requests
            if request.method == 'GET':
                cached_data = cache.get(cache_key)
                if cached_data:
                    # Add dynamic staff fields
                    cached_data['is_staff'] = request.user.is_staff
                    cached_data['is_superuser'] = request.user.is_superuser
                    return Response(cached_data)
            
            # Fetch profile with optimized query
            profile, created = Profile.objects.select_related('user').get_or_create(user=request.user)
            
            if request.method == 'PATCH':
                serializer = self.get_serializer(profile, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    data = serializer.data
                    data['is_staff'] = request.user.is_staff
                    data['is_superuser'] = request.user.is_superuser
                    # Invalidate cache after update
                    cache.delete(cache_key)
                    return Response(data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = self.get_serializer(profile)
                data = serializer.data
                data['is_staff'] = request.user.is_staff
                data['is_superuser'] = request.user.is_superuser
                # Cache the profile data for 5 minutes
                cache.set(cache_key, data, 300)
                return Response(data)
        return Response({"detail": "Not authenticated"}, status=401)

    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def all_catalysts(self, request):
        """
        Get all catalysts with location data for map display.
        Returns SAME structure as nearby_catalysts for consistency.
        """
        try:
            catalysts = Profile.objects.filter(
                role='CATALYST',
                latitude__isnull=False,
                longitude__isnull=False
            ).select_related('user').only(
                'id', 'latitude', 'longitude', 'bio_short', 'gender', 'age',
                'hourly_rate', 'average_rating', 'rating_count',
                'user__id', 'user__username', 'user__first_name', 'user__last_name'
            )
            
            data = [{
                'id': c.id,
                'user_id': c.user.id,
                'name': c.user.get_full_name() or c.user.username,
                'username': c.user.username,
                'bio': c.bio_short or '',
                'gender': c.gender,
                'age': c.age,
                'latitude': c.latitude,
                'longitude': c.longitude,
                'hourly_rate': str(c.hourly_rate) if c.hourly_rate else None,
                'average_rating': float(c.average_rating),
                'rating_count': c.rating_count,
            } for c in catalysts]
            
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            
            # Optimized query: select_related for user, only fetch needed fields
            catalysts = Profile.objects.filter(
                role='CATALYST',
                latitude__isnull=False,
                longitude__isnull=False
            ).select_related('user').only(
                'id', 'latitude', 'longitude', 'bio_short', 'specializations',
                'hourly_rate', 'average_rating', 'rating_count',
                'user__id', 'user__username', 'user__first_name', 'user__last_name'
            )
            
            # Calculate distance for each catalyst and filter by radius
            nearby_catalysts = []
            R = 6371000  # Earth's radius in meters
            lat1 = radians(user_lat)
            lon1 = radians(user_lon)
            
            for catalyst in catalysts:
                # Haversine formula
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
                        'bio': catalyst.bio_short or '',  # Use short bio only
                        'latitude': catalyst.latitude,
                        'longitude': catalyst.longitude,
                        'specializations': catalyst.specializations[:3] if catalyst.specializations else [],  # Limit to 3
                        'hourly_rate': str(catalyst.hourly_rate) if catalyst.hourly_rate else None,
                        'distance': round(distance),
                        'average_rating': float(catalyst.average_rating),
                        'rating_count': catalyst.rating_count,
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
        
        # Optimize queries to prevent N+1 issues
        # We need seeker, catalyst, and their profiles, plus the service details
        queryset = queryset.select_related(
            'seeker', 
            'catalyst', 
            'seeker__profile', 
            'catalyst__profile', 
            'service'
        )
        
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
        Delete/Cancel a booking.
        - Seekers can delete REQUESTED bookings (pending requests)
        - Catalysts can delete CONFIRMED or COMPLETED bookings (matched seekers)
        """
        booking = self.get_object()
        
        # Check authorization based on user role and booking status
        if booking.status == 'REQUESTED':
            # Seeker can delete their own pending requests
            if booking.seeker != request.user:
                return Response(
                    {"error": "You are not authorized to delete this booking"},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif booking.status in ['CONFIRMED', 'COMPLETED']:
            # Catalyst can delete matched seekers
            if booking.catalyst != request.user:
                return Response(
                    {"error": "You are not authorized to delete this booking"},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
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

    @action(detail=False, methods=['GET'])
    def pending(self, request):
        """
        Get pending booking requests for seeker.
        Ultra-lightweight: only essential fields.
        """
        try:
            bookings = Booking.objects.filter(
                seeker=request.user, 
                status='REQUESTED'
            ).select_related('catalyst__profile').only(
                'id', 'created_at', 'notes', 'catalyst__id', 'catalyst__username',
                'catalyst__profile__id', 'catalyst__profile__gender', 
                'catalyst__profile__age', 'catalyst__profile__bio_short'
            )
            
            data = [{
                'id': b.id,
                'created_at': b.created_at,
                'notes': b.notes,
                'catalyst': {
                    'id': b.catalyst.id,
                    'username': b.catalyst.username,
                    'profile': {
                        'id': b.catalyst.profile.id,
                        'gender': b.catalyst.profile.gender,
                        'age': b.catalyst.profile.age,
                        'bio_short': b.catalyst.profile.bio_short,
                    }
                }
            } for b in bookings]
            
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['GET'])
    def matched(self, request):
        """
        Get matched catalysts (CONFIRMED/COMPLETED) with their ratings.
        Returns all needed data in one call.
        """
        try:
            # Get matched bookings
            bookings = Booking.objects.filter(
                seeker=request.user,
                status__in=['CONFIRMED', 'COMPLETED']
            ).select_related('catalyst__profile').only(
                'id', 'status', 'created_at', 'catalyst__id', 'catalyst__username',
                'catalyst__profile__id', 'catalyst__profile__gender',
                'catalyst__profile__age', 'catalyst__profile__bio_short',
                'catalyst__profile__specializations'
            )
            
            # Get all ratings for this seeker in one query
            ratings = Rating.objects.filter(seeker=request.user).select_related('catalyst')
            ratings_map = {r.catalyst.id: {'id': r.id, 'rating': r.rating} for r in ratings}
            
            data = [{
                'id': b.id,
                'status': b.status,
                'created_at': b.created_at,
                'catalyst': {
                    'id': b.catalyst.id,
                    'username': b.catalyst.username,
                    'profile': {
                        'id': b.catalyst.profile.id,
                        'gender': b.catalyst.profile.gender,
                        'age': b.catalyst.profile.age,
                        'bio_short': b.catalyst.profile.bio_short,
                        'specializations': b.catalyst.profile.specializations[:3] if b.catalyst.profile.specializations else [],
                    }
                },
                'rating': ratings_map.get(b.catalyst.id)
            } for b in bookings]
            
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for ratings.
    """
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return ratings given by the user or received by the user (if catalyst).
        """
        user = self.request.user
        queryset = Rating.objects.all()
        
        # Filter by catalyst if specified
        catalyst_id = self.request.query_params.get('catalyst_id')
        if catalyst_id:
            queryset = queryset.filter(catalyst_id=catalyst_id)
        
        # Filter by seeker if specified
        seeker_id = self.request.query_params.get('seeker_id')
        if seeker_id:
            queryset = queryset.filter(seeker_id=seeker_id)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user)


class AdminDataViewSet(viewsets.ViewSet):
    """
    ViewSet for admin dashboard data.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    @action(detail=False, methods=['GET'])
    def dashboard_stats(self, request):
        try:
            from django.db.models import Count, Prefetch
            from django.core.cache import cache
            
            # Check cache first (cache for 2 minutes)
            cache_key = 'admin_dashboard_stats'
            cached_data = cache.get(cache_key)
            if cached_data:
                return Response(cached_data)
            
            # Bulk fetch all report counts (one query)
            report_counts = {}
            for report in Report.objects.values('reported_user_id').annotate(count=Count('id')):
                report_counts[report['reported_user_id']] = report['count']
            
            # Bulk fetch all booking counts for seekers (one query)
            seeker_booking_counts = {}
            for booking in Booking.objects.values('seeker_id').annotate(count=Count('id')):
                seeker_booking_counts[booking['seeker_id']] = booking['count']
            
            # Get all confirmed/completed bookings with related data (one query)
            all_matches = Booking.objects.filter(
                status__in=['CONFIRMED', 'COMPLETED']
            ).select_related('seeker', 'catalyst').values(
                'catalyst_id', 'seeker__username', 'seeker__email',
                'seeker__first_name', 'seeker__last_name', 'status', 'created_at'
            )
            
            # Group matches by catalyst
            catalyst_matches = {}
            for match in all_matches:
                catalyst_id = match['catalyst_id']
                if catalyst_id not in catalyst_matches:
                    catalyst_matches[catalyst_id] = []
                seeker_name = f"{match['seeker__first_name']} {match['seeker__last_name']}".strip() or match['seeker__username']
                catalyst_matches[catalyst_id].append({
                    'seeker_name': seeker_name,
                    'seeker_email': match['seeker__email'],
                    'status': match['status'],
                    'date': match['created_at']
                })
            
            # 1. Get all catalysts with stats (one query)
            catalysts_qs = Profile.objects.filter(role='CATALYST').select_related('user')
            catalysts_data = []
            
            for cat in catalysts_qs:
                matches = catalyst_matches.get(cat.user.id, [])
                catalysts_data.append({
                    'id': cat.id,
                    'user_id': cat.user.id,
                    'name': cat.user.get_full_name() or cat.user.username,
                    'email': cat.user.email,
                    'average_rating': cat.average_rating,
                    'rating_count': cat.rating_count,
                    'match_count': len(matches),
                    'matches': matches,
                    'report_count': report_counts.get(cat.user.id, 0)
                })

            # 2. Get all seekers (one query)
            seekers_qs = Profile.objects.filter(role='SEEKER').exclude(user__email='admin@mattter.com').select_related('user')
            seekers_data = []

            for seeker in seekers_qs:
                seekers_data.append({
                    'id': seeker.id,
                    'user_id': seeker.user.id,
                    'name': seeker.user.get_full_name() or seeker.user.username,
                    'email': seeker.user.email,
                    'joined_at': seeker.user.date_joined,
                    'booking_count': seeker_booking_counts.get(seeker.user.id, 0),
                    'report_count': report_counts.get(seeker.user.id, 0)
                })

            response_data = {
                'success': True,
                'catalysts': catalysts_data,
                'seekers': seekers_data
            }
            
            # Cache for 2 minutes
            cache.set(cache_key, response_data, 120)
            
            return Response(response_data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['DELETE'])
    def delete_user(self, request):
        """
        Permanently delete a user account.
        Query param: user_id
        """
        import django.db.transaction as transaction
        
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                user = User.objects.get(id=user_id)
                # prevent deleting the admin user if one exists with that email (though distinct from hardcoded frontend auth, better safe)
                if user.email == 'admin@mattter.com':
                     return Response(
                        {"error": "Cannot delete root admin account"},
                        status=status.HTTP_403_FORBIDDEN
                    )

                user.delete()
            
            return Response({
                "success": True, 
                "message": "User deleted successfully"
            })
            
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )





    @action(detail=False, methods=['GET'])
    def user_details(self, request):
        """
        Get detailed information for a specific user including full profile and report history.
        Query param: user_id
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            profile = Profile.objects.get(user=user)
            
            # Serialize profile data
            profile_serializer = ProfileSerializer(profile)
            profile_data = profile_serializer.data
            
            # Add extra user info not in profile serializer
            profile_data['username'] = user.username
            profile_data['email'] = user.email
            profile_data['first_name'] = user.first_name
            profile_data['last_name'] = user.last_name
            profile_data['date_joined'] = user.date_joined
            
            # Fetch reports filed AGAINST this user
            reports = Report.objects.filter(reported_user=user).select_related('reporter')
            reports_data = []
            for report in reports:
                reports_data.append({
                    'id': report.id,
                    'reporter_name': report.reporter.username,
                    'reason': report.reason,
                    'status': report.status,
                    'created_at': report.created_at,
                    'resolved_at': report.resolved_at
                })

            # Fetch Match History (Confirmed/Completed Bookings)
            matches_data = []
            if profile.role == 'CATALYST':
                bookings = Booking.objects.filter(
                    catalyst=user,
                    status__in=['CONFIRMED', 'COMPLETED']
                ).select_related('seeker', 'service')
                
                for booking in bookings:
                    matches_data.append({
                        'id': booking.id,
                        'other_party_name': booking.seeker.get_full_name() or booking.seeker.username,
                        'other_party_role': 'Seeker',
                        'service': booking.service.name if booking.service else 'General',
                        'status': booking.status,
                        'date': booking.created_at
                    })
            elif profile.role == 'SEEKER':
                bookings = Booking.objects.filter(
                    seeker=user,
                    status__in=['CONFIRMED', 'COMPLETED']
                ).select_related('catalyst', 'service')
                
                for booking in bookings:
                    matches_data.append({
                        'id': booking.id,
                        'other_party_name': booking.catalyst.get_full_name() or booking.catalyst.username,
                        'other_party_role': 'Catalyst',
                        'service': booking.service.name if booking.service else 'General',
                        'status': booking.status,
                        'date': booking.created_at
                    })
                
            return Response({
                'success': True,
                'profile': profile_data,
                'reports': reports_data,
                'matches': matches_data
            })
            
        except User.DoesNotExist:
             return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
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


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Force status to PENDING for new reports
        serializer.save(reporter=self.request.user, status='PENDING')

    def perform_update(self, serializer):
        # Update resolved_at if status changes to RESOLVED
        instance = serializer.instance
        new_status = serializer.validated_data.get('status', instance.status)
        
        if new_status == 'RESOLVED' and instance.status != 'RESOLVED':
            serializer.save(resolved_at=timezone.now())
        else:
            serializer.save()
