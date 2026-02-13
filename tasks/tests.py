from django.test import TestCase

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Task

class TaskApiTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="pass12345")
        self.user2 = User.objects.create_user(username="user2", password="pass12345")

    def get_token(self, username, password):
        response = self.client.post(
            "/api/token/",
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_register_user(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
                "password_confirm": "password123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_get_tasks_requires_auth(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_sees_only_own_tasks(self):
        Task.objects.create(user=self.user1, title="Task 1")
        Task.objects.create(user=self.user2, title="Task 2")

        token = self.get_token("user1", "pass12345")
        self.auth(token)

        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item["title"] for item in response.data["results"]]
        self.assertIn("Task 1", titles)
        self.assertNotIn("Task 2", titles)

    def test_create_task(self):
        token = self.get_token("user1", "pass12345")
        self.auth(token)

        response = self.client.post(
            "/api/tasks/",
            {"title": "New Task", "description": "Test", "completed": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Task")

    def test_user_cannot_update_other_users_task(self):
        task = Task.objects.create(user=self.user2, title="Other Task")

        token = self.get_token("user1", "pass12345")
        self.auth(token)

        response = self.client.put(
            f"/api/tasks/{task.id}/",
            {"title": "Hacked", "description": "", "completed": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_delete_other_users_task(self):
        task = Task.objects.create(user=self.user2, title="Other Task")

        token = self.get_token("user1", "pass12345")
        self.auth(token)

        response = self.client.delete(f"/api/tasks/{task.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_completed(self):
        Task.objects.create(user=self.user1, title="Done", completed=True)
        Task.objects.create(user=self.user1, title="Todo", completed=False)

        token = self.get_token("user1", "pass12345")
        self.auth(token)

        response = self.client.get("/api/tasks/?completed=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item["title"] for item in response.data["results"]]
        self.assertIn("Done", titles)
        self.assertNotIn("Todo", titles)

    def test_search_tasks(self):
        Task.objects.create(user=self.user1, title="Buy milk", description="Groceries")
        Task.objects.create(user=self.user1, title="Read book", description="Study")

        token = self.get_token("user1", "pass12345")
        self.auth(token)

        response = self.client.get("/api/tasks/?search=milk")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item["title"] for item in response.data["results"]]
        self.assertEqual(titles, ["Buy milk"])