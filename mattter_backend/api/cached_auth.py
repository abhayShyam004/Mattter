"""
Cached Token Authentication for Django REST Framework

This module provides a cached version of TokenAuthentication that reduces
database hits for token validation by caching the user data in memory.
"""

from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.core.cache import cache
from rest_framework import exceptions


class CachedTokenAuthentication(TokenAuthentication):
    """
    Token authentication with caching to reduce database round-trips.
    
    Caches user objects for 5 minutes after successful token validation.
    This dramatically improves performance when using remote databases.
    """
    
    CACHE_TIMEOUT = 300  # 5 minutes
    
    def authenticate_credentials(self, key):
        """
        Override to check cache before hitting the database.
        """
        cache_key = f'token_auth_{key}'
        
        # Try to get from cache first
        cached_user = cache.get(cache_key)
        if cached_user is not None:
            if cached_user == 'INVALID':
                raise exceptions.AuthenticationFailed('Invalid token.')
            return (cached_user, key)
        
        # Cache miss - query database
        model = self.get_model()
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            # Cache the invalid result to prevent repeated DB hits
            cache.set(cache_key, 'INVALID', self.CACHE_TIMEOUT)
            raise exceptions.AuthenticationFailed('Invalid token.')
        
        if not token.user.is_active:
            raise exceptions.AuthenticationFailed('User inactive or deleted.')
        
        # Cache the user object
        cache.set(cache_key, token.user, self.CACHE_TIMEOUT)
        
        return (token.user, token)
