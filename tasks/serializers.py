from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'user', 'title', 'description', 'completed', 
            'created_at', 'updated_at', 'due_date', 'end_date', 'color',
            'reminder_preference', 'reminder_sent'
        ]
        read_only_fields = ['reminder_sent', 'created_at', 'updated_at']