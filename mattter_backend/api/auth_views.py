from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .models import User, Profile
from .serializers import UserSerializer, ProfileSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            role = request.data.get('role', 'SEEKER')
            gender = request.data.get('gender')
            age = request.data.get('age')
            
            print(f"Registration attempt - Username: {username}, Email: {email}, Role: {role}, Gender: {gender}, Age: {age}")
            
            if not username or not password:
                return Response({'error': 'Username and password are required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email or '',
                password=password
            )
            print(f"User created: {user.id}")
            
            # Create profile with role, gender, and age
            profile = Profile.objects.create(
                user=user,
                role=role,
                gender=gender,
                age=int(age) if age else None
            )
            print(f"Profile created: {profile.id}")
            
            # Generate token
            token, created = Token.objects.get_or_create(user=user)
            print(f"Token created: {token.key[:10]}...")
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Registration error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Registration failed: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = {
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        }
        
        # Use select_related to fetch profile in same query
        try:
            profile = Profile.objects.select_related('user').get(user=user)
            response_data['user']['role'] = profile.role
        except Profile.DoesNotExist:
            pass
            
        return Response(response_data)
