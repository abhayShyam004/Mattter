from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import ProfileViewSet, WardrobeItemViewSet, ServiceViewSet, BookingViewSet, MessageViewSet
from .auth_views import RegisterView

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'wardrobe', WardrobeItemViewSet, basename='wardrobe')
router.register (r'services', ServiceViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('register/', RegisterView.as_view(), name='register'),
]
