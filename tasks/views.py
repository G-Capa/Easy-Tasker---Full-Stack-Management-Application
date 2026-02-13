
# TaskViewSet handles all CRUD operations for Task objects
#  automatically converting between JSON and model instances, 
# with read access for anyone and write access only for authenticated users, 


from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Task
from .serializers import TaskSerializer, UserRegistrationSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    authentication_classes = (JWTAuthentication,)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['completed']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'completed']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only tasks belonging to the authenticated user"""
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Automatically assign the task to the authenticated user"""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Ensure user can only update their own tasks"""
        task = self.get_object()
        if task.user != self.request.user:
            raise PermissionDenied("You can only update your own tasks.")
        serializer.save()

    def perform_destroy(self, instance):
        """Ensure user can only delete their own tasks"""
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own tasks.")
        instance.delete()