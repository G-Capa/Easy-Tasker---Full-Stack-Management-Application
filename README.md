# 🎯 EasyTasker - Full-Stack Task Management Application

A modern, full-stack task management application built with **Django REST Framework** and **React**, featuring JWT authentication, drag-and-drop calendar, and real-time reminder alerts.
This is not a deployable project YET! It was made for learning and practice.

![Tech Stack](https://img.shields.io/badge/Django-6.0.2-green)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Task Management Flow](#task-management-flow)
- [Frontend-Backend Communication](#frontend-backend-communication)
- [Setup & Installation](#setup--installation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Testing](#testing)

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Container :5173"
        A[React App + Vite]
        B[Framer Motion Animations]
        C[Drag & Drop Calendar]
        D[Local Storage JWT]
    end
    
    subgraph "Backend Container :8000"
        E[Django REST Framework]
        F[JWT Authentication]
        G[Task ViewSet]
        H[User Registration]
    end
    
    subgraph "Persistence"
        I[(SQLite Database)]
    end
    
    A -->|HTTP Requests + JWT Bearer Token| E
    E -->|JSON Responses| A
    E -->|ORM Queries| I
    F -->|Validate Token| D
    G -->|CRUD Operations| I
    H -->|Create Users| I
```

---

## ✨ Features

### Authentication & Authorization
- ✅ User registration with password confirmation
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Protected API endpoints
- ✅ User-specific task isolation

### Task Management
- ✅ Create, Read, Update, Delete (CRUD) tasks
- ✅ Task completion toggling
- ✅ Rich task details (title, description, dates)
- ✅ Date range selection with drag-and-drop calendar
- ✅ Color-coded task visualization

### Advanced Features
- ✅ **Filtering**: Filter tasks by completion status
- ✅ **Search**: Search tasks by title/description
- ✅ **Sorting**: Order by date, completion status
- ✅ **Pagination**: Handle large task lists efficiently
- ✅ **Reminders**: Set alerts (1 hour, 1 day, 1 week before)
- ✅ **In-App Alerts**: Real-time reminder notifications
- ✅ **Responsive Design**: Mobile, tablet, desktop support
- ✅ **Smooth Animations**: Framer Motion transitions

### UI/UX
- 🎨 Custom gradient themes
- 🖱️ Drag-and-drop date selection
- 📅 Interactive calendar widget
- 🔔 Dismissible alert notifications
- 🎭 Smooth enter/exit animations
- 📱 Fully responsive design
  (Big thanks to https://reactbits.dev/ ) 

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 6.0.2 | Web framework |
| Django REST Framework | 3.16.1 | RESTful API |
| SimpleJWT | 5.5.1 | JWT authentication |
| django-filter | 24.1 | Query filtering |
| django-cors-headers | 4.4.0 | CORS handling |
| python-dotenv | 1.2.1 | Environment variables |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| Vite | 7.3.1 | Build tool & dev server |
| Framer Motion | 11.0.0 | Animations |

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **SQLite** - Development database
- **Node 20 Alpine** - Frontend container
- **Python 3.12 Slim** - Backend container

---

## 🔄 System Architecture

### Request-Response Cycle

```mermaid
sequenceDiagram
    participant User
    participant React
    participant LocalStorage
    participant Django
    participant Database

    User->>React: Interacts with UI
    React->>LocalStorage: Get JWT Token
    LocalStorage-->>React: Token
    React->>Django: HTTP Request + Bearer Token
    Django->>Django: Validate JWT
    Django->>Database: ORM Query
    Database-->>Django: Query Result
    Django-->>React: JSON Response
    React->>React: Update State
    React-->>User: Re-render UI
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register/` | ❌ | Register new user |
| POST | `/token/` | ❌ | Obtain JWT token |
| POST | `/token/refresh/` | ❌ | Refresh JWT token |
| GET | `/tasks/` | ✅ | List user's tasks |
| POST | `/tasks/` | ✅ | Create new task |
| GET | `/tasks/{id}/` | ✅ | Get specific task |
| PUT | `/tasks/{id}/` | ✅ | Update task |
| DELETE | `/tasks/{id}/` | ✅ | Delete task |

### Query Parameters

**Filtering:**
```
GET /api/tasks/?completed=true
GET /api/tasks/?completed=false
```

**Searching:**
```
GET /api/tasks/?search=important
```

**Ordering:**
```
GET /api/tasks/?ordering=-created_at
GET /api/tasks/?ordering=completed
```

**Combining:**
```
GET /api/tasks/?completed=false&search=urgent&ordering=-created_at
```

---

## 🔐 Authentication Flow

### Registration Process

```mermaid
sequenceDiagram
    participant User
    participant React
    participant Django
    participant Database

    User->>React: Fill registration form
    React->>React: Validate passwords match
    React->>Django: POST /api/register/
    Note over React,Django: {username, email, password, password_confirm}
    Django->>Django: Validate data
    Django->>Django: Hash password
    Django->>Database: Create User
    Database-->>Django: User created
    Django-->>React: 201 Created
    React-->>User: Show success message
```

**Request Example:**
```json
POST /api/register/
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

**Response:**
```json
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

### Login Process

```mermaid
sequenceDiagram
    participant User
    participant React
    participant LocalStorage
    participant Django

    User->>React: Enter credentials
    React->>Django: POST /api/token/
    Note over React,Django: {username, password}
    Django->>Django: Verify credentials
    Django->>Django: Generate JWT tokens
    Django-->>React: {access, refresh}
    React->>LocalStorage: Store access token
    React->>React: Redirect to dashboard
    React-->>User: Show task list
```

**Request Example:**
```json
POST /api/token/
{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### JWT Token Structure

```mermaid
graph LR
    A[JWT Token] --> B[Header]
    A --> C[Payload]
    A --> D[Signature]
    
    B --> B1[Algorithm: HS256]
    B --> B2[Type: JWT]
    
    C --> C1[User ID]
    C --> C2[Username]
    C --> C3[Expiration]
    
    D --> D1[Secret Key Signature]
```

### Authenticated Requests

All protected endpoints require the JWT token in the `Authorization` header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Frontend Implementation (`Api.js`):**
```javascript
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  // Handle response...
}
```

---

## 📝 Task Management Flow

### Creating a Task

```mermaid
sequenceDiagram
    participant User
    participant Calendar
    participant React
    participant Django
    participant Database

    User->>Calendar: Drag date from calendar
    Calendar->>React: Drop event with date
    React->>React: Update form state
    User->>React: Fill task details
    User->>React: Submit form
    React->>Django: POST /api/tasks/
    Note over React,Django: {title, description, due_date, etc}
    Django->>Django: Validate JWT
    Django->>Django: Check permissions
    Django->>Django: Assign user to task
    Django->>Database: INSERT task
    Database-->>Django: Task created
    Django-->>React: 201 Created + Task JSON
    React->>React: Add task to state
    React-->>User: Show success + updated list
```

**Request Example:**
```json
POST /api/tasks/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "due_date": "2026-02-15T14:00:00Z",
  "end_date": "2026-02-16T14:00:00Z",
  "reminder_preference": "1_day",
  "completed": false,
  "color": "hsl(45, 100%, 65%)"
}
```

**Response:**
```json
{
  "id": 42,
  "user": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "due_date": "2026-02-15T14:00:00Z",
  "end_date": "2026-02-16T14:00:00Z",
  "reminder_preference": "1_day",
  "reminder_sent": false,
  "completed": false,
  "color": "hsl(45, 100%, 65%)",
  "created_at": "2026-02-13T10:30:00Z",
  "updated_at": "2026-02-13T10:30:00Z"
}
```

### Task Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Todo: Create Task
    Todo --> InProgress: User starts work
    InProgress --> Completed: Mark as Done
    Completed --> Todo: Reopen Task
    Todo --> Editing: Click Edit
    InProgress --> Editing: Click Edit
    Editing --> Todo: Save Changes
    Editing --> InProgress: Save Changes
    Todo --> [*]: Delete
    InProgress --> [*]: Delete
    Completed --> [*]: Delete
```

### Permission Checking

```mermaid
flowchart TD
    A[API Request] --> B{JWT Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Task Exists?}
    D -->|No| E[404 Not Found]
    D -->|Yes| F{User Owns Task?}
    F -->|No| G[403 Forbidden]
    F -->|Yes| H[Process Request]
    H --> I[Return Response]
```

**Backend Implementation (`views.py`):**
```python
def perform_update(self, serializer):
    """Ensure user can only update their own tasks"""
    task = self.get_object()
    if task.user != self.request.user:
        raise PermissionDenied("You can only update your own tasks")
    serializer.save()
```

---

## 🌐 Frontend-Backend Communication

### State Management Flow

```mermaid
graph TB
    A[User Action] --> B[Event Handler]
    B --> C{API Call Needed?}
    C -->|Yes| D[Api.js Function]
    C -->|No| E[Update Local State]
    D --> F[HTTP Request]
    F --> G[Django Backend]
    G --> H[Process & Respond]
    H --> I[JSON Response]
    I --> J[Update React State]
    J --> K[Re-render Component]
    K --> L[User Sees Update]
    E --> K
```

### React Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[Auth Forms]
    A --> C[Task Form]
    A --> D[DraggableCalendar]
    A --> E[AnimatedList]
    A --> F[Alerts Bar]
    
    B --> B1[Login Form]
    B --> B2[Register Form]
    
    E --> E1[TaskCard]
    E --> E2[TaskCard]
    E --> E3[TaskCard]
    
    C --> D
    D --> |Drag & Drop| C
    
    F --> F1[Alert Item]
    F --> F2[Alert Item]
```

### Real-Time Alerts System

```mermaid
sequenceDiagram
    participant Timer
    participant React
    participant Task[]
    participant Django

    loop Every 60 seconds
        Timer->>React: Trigger checkTaskReminders()
        React->>Task[]: Iterate through tasks
        Task[]-->>React: Get tasks with reminders
        React->>React: Calculate time until due
        React->>React: Check if alert needed
        React->>React: Update alerts state
        React-->>User: Display alert notification
    end
    
    User->>React: Click dismiss button
    React->>Django: PATCH /api/tasks/{id}/
    Note over React,Django: {reminder_sent: true}
    Django-->>React: 200 OK
    React->>React: Update local state
    React->>React: Remove alert from UI
```

**Frontend Implementation:**
```javascript
const checkTaskReminders = () => {
  const now = new Date();
  const newAlerts = [];
  
  tasks.forEach(task => {
    if (task.completed || task.reminder_sent) return;
    if (!task.due_date || task.reminder_preference === 'none') return;
    
    const dueDate = new Date(task.due_date);
    const timeDiff = dueDate - now;
    
    // Calculate reminder window based on preference
    let reminderWindow;
    switch(task.reminder_preference) {
      case '1_hour': reminderWindow = 60 * 60 * 1000; break;
      case '1_day': reminderWindow = 24 * 60 * 60 * 1000; break;
      case '1_week': reminderWindow = 7 * 24 * 60 * 60 * 1000; break;
    }
    
    if (timeDiff > 0 && timeDiff <= reminderWindow) {
      newAlerts.push(task);
    }
  });
  
  setAlerts(newAlerts);
};
```

### Calendar Drag & Drop Flow

```mermaid
sequenceDiagram
    participant User
    participant Calendar
    participant TaskForm
    participant State

    User->>Calendar: Click and drag date
    Calendar->>Calendar: handleDragStart(date)
    Note over Calendar: Store date in dataTransfer
    User->>TaskForm: Drop on form
    TaskForm->>TaskForm: handleDrop(event)
    TaskForm->>TaskForm: Extract date from event
    TaskForm->>State: Update due_date
    TaskForm->>State: Update selectedColor
    State-->>TaskForm: Re-render with new date
    TaskForm-->>User: Show selected date
```

---

## 🚀 Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/easytasker.git
cd easytasker
```

2. **Make setup script executable:**
```bash
chmod +x setup.sh
```

3. **Run the application:**
```bash
./setup.sh
```

Or using Make:
```bash
make up
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### Docker Architecture

```mermaid
graph TB
    subgraph "Docker Network"
        A[web_api Container]
        B[frontend Container]
        C[Shared Volume: db_data]
        D[Shared Volume: node_modules]
    end
    
    A -->|Port 8000| E[Host Machine :8000]
    B -->|Port 5173| F[Host Machine :5173]
    A --> C
    B --> D
    
    style A fill:#2ecc71
    style B fill:#3498db
    style C fill:#e74c3c
    style D fill:#e74c3c
```

**`docker-compose.yml` structure:**
```yaml
services:
  web_api:
    build: .
    command: sh -c "python3 manage.py makemigrations --noinput && \
                    python3 manage.py migrate && \
                    python3 manage.py runserver 0.0.0.0:8000"
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - ./db_data:/app/db_data

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - web_api
```

### Manual Setup (Without Docker)

**Backend:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📁 Project Structure

```
taskmanager/
├── core/                          # Django project settings
│   ├── __init__.py
│   ├── settings.py               # Main configuration
│   ├── urls.py                   # Root URL routing
│   ├── wsgi.py                   # WSGI config
│   └── asgi.py                   # ASGI config
│
├── tasks/                         # Main Django app
│   ├── models.py                 # Task model definition
│   ├── serializers.py            # DRF serializers
│   ├── views.py                  # API views & ViewSets
│   ├── urls.py                   # App URL routing
│   ├── admin.py                  # Django admin config
│   ├── tests.py                  # Unit tests
│   └── migrations/               # Database migrations
│
├── frontend/                      # React application
│   ├── src/
│   │   ├── App.jsx               # Main component
│   │   ├── App.css               # Global styles
│   │   ├── Api.js                # API utilities
│   │   ├── main.jsx              # Entry point
│   │   └── components/
│   │       ├── AnimatedList.jsx  # Animated task list
│   │       ├── AnimatedList.css
│   │       ├── TaskCard.jsx      # Individual task card
│   │       ├── DraggableCalendar.jsx  # Interactive calendar
│   │       ├── Calendar.jsx      # Static calendar
│   │       └── Calendar.css
│   ├── index.html                # HTML template
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite configuration
│   └── Dockerfile                # Frontend container
│
├── db_data/                       # SQLite database
│   └── db.sqlite3
│
├── Dockerfile                     # Backend container
├── docker-compose.yml             # Multi-container orchestration
├── requirements.txt               # Python dependencies
├── manage.py                      # Django management script
├── setup.sh                       # Setup automation script
├── Makefile                       # Build automation
└── README.md                      # This file
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o{ TASK : owns
    
    USER {
        int id PK
        string username
        string email
        string password
        datetime date_joined
        datetime last_login
    }
    
    TASK {
        int id PK
        int user_id FK
        string title
        text description
        boolean completed
        datetime created_at
        datetime updated_at
        datetime due_date
        datetime end_date
        string color
        string reminder_preference
        boolean reminder_sent
    }
```

### Task Model Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key | Auto-incremented |
| user | ForeignKey | NOT NULL | Reference to User |
| title | CharField(255) | NOT NULL | Task title |
| description | TextField | Optional | Detailed description |
| completed | Boolean | Default: False | Completion status |
| created_at | DateTime | Auto | Creation timestamp |
| updated_at | DateTime | Auto | Last update timestamp |
| due_date | DateTime | Optional | When task is due |
| end_date | DateTime | Optional | Task end date |
| color | CharField(50) | Optional | Calendar display color |
| reminder_preference | CharField(10) | Choices | none/1_hour/1_day/1_week |
| reminder_sent | Boolean | Default: False | Alert dismissed flag |

### Model Relationships

```python
class Task(models.Model):
    REMINDER_CHOICES = [
        ('none', 'No Reminder'),
        ('1_hour', '1 Hour Before'),
        ('1_day', '1 Day Before'),
        ('1_week', '1 Week Before'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # ... other fields
    
    class Meta:
        ordering = ["-created_at"]
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test tasks

# Run with verbosity
python manage.py test --verbosity=2
```

### Test Coverage

Current test suite includes:
- ✅ User registration
- ✅ JWT token generation
- ✅ Task CRUD operations
- ✅ Permission checking
- ✅ Task filtering
- ✅ Search functionality
- ✅ User isolation

**Example test:**
```python
def test_user_sees_only_own_tasks(self):
    Task.objects.create(user=self.user1, title="Task 1")
    Task.objects.create(user=self.user2, title="Task 2")
    
    token = self.get_token("user1", "pass12345")
    self.auth(token)
    
    response = self.client.get("/api/tasks/")
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(len(response.data), 1)
    self.assertEqual(response.data[0]["title"], "Task 1")
```

---

## 🔧 Make Commands

```bash
make everything        # Start all services
make re        # Rebuild and restart
make fclean    # Stop and clean everything
```

---

## 🎨 UI Features

### Color Theming
Users can customize the gradient background colors through the color picker interface.

### Animations
- Smooth fade-in/fade-out using Framer Motion
- Scale animations on task cards
- Gradient shifts on backgrounds
- Alert slide-in animations

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (Django default)
- ✅ CORS protection
- ✅ User isolation (can only see/modify own tasks)
- ✅ Permission checking on all endpoints
- ✅ SQL injection protection (Django ORM)
- ✅ XSS protection (React escaping)

---

## 🚧 Future Enhancements I may or may not implement

- [ ] PostgreSQL for production
- [ ] Task categories/tags
- [ ] File attachments
- [ ] Task sharing between users
- [ ] WebSocket for real-time updates
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Export tasks to CSV/PDF
- [ ] Dark/Light mode toggle
- [ ] Task templates

---

Built as a learning project to master:
- Django REST Framework
- React Hooks & State Management
- Docker containerization
- JWT Authentication
- Modern UI/UX patterns

