from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    REMINDER_CHOICES = [
        ('none', 'No Reminder'),
        ('1_hour', '1 Hour Before'),
        ('1_day', '1 Day Before'),
        ('1_week', '1 Week Before'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    reminder_preference = models.CharField(
        max_length=10,
        choices=REMINDER_CHOICES,
        default='none'
    )
    reminder_sent = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

