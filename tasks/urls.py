from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TaskViewSet, register

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('register/', register, name='register'),
] + router.urls