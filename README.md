# Endometriosis Learning Platform

A structured, interactive web-based learning platform for endometriosis education. Built as a university project for CS3028/CS3528 at the University of Aberdeen.

The platform delivers clinically grounded educational content through a hierarchy of courses, modules, and lessons, with embedded quizzes and progress tracking — bridging the gap between dense clinical resources and unreliable social media information.

---

## Table of Contents

- [Purpose](#purpose)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Demo Credentials](#demo-credentials)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Extending the System](#extending-the-system)
- [Known Issues](#known-issues)
- [Licence](#licence)

---

## Purpose

Endometriosis affects approximately 1 in 10 women of reproductive age, yet patients frequently lack access to structured, verified educational resources after diagnosis. Existing information is either clinically dense and hard to navigate (NHS pages, medical journals) or accessible but unreliable (social media, forums).

This platform addresses that gap by providing:

- **Structured learning** — content organised into Courses → Modules → Lessons, reducing cognitive overload through progressive knowledge building
- **Active assessment** — interactive quizzes with flexible question formats and instant feedback
- **Progress tracking** — per-lesson completion tracking visible on the learner dashboard
- **Certificate generation** — formal recognition upon course completion
- **Role-based access** — separate learner and administrator experiences, with full content management for admins
- **Responsive design** — accessible across desktop and mobile with dark mode support

---

## Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Flask | 2.3.3 |
| ORM | SQLAlchemy | 2.0.44 |
| Database | SQLite (dev) / PostgreSQL (prod) | — |
| Authentication | Flask-JWT-Extended | 4.4.4 |
| Password Hashing | Flask-Bcrypt | 1.0.1 |
| Input Validation | Marshmallow | 4.1.0 |
| Schema Integration | marshmallow-sqlalchemy | 1.4.2 |
| CORS | Flask-Cors | 4.0.2 |
| Environment Config | python-dotenv | 1.0.1 |
| Testing | pytest | 8.4.2 |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.0.0 |
| UI Library | React | 19.2.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Linting | ESLint | ^9 |

---

## Prerequisites

Before installing, ensure you have the following installed on your system:

- **Python** 3.10 or higher — [python.org](https://www.python.org/downloads/)
- **pip** (included with Python)
- **Node.js** 20.9.0 or higher — [nodejs.org](https://nodejs.org/)
- **npm** (included with Node.js)
- **Git** — [git-scm.com](https://git-scm.com/)

---

## Project Structure

```
endo/
├── backend/
│   ├── app.py                  # Application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── server/
│   │   ├── __init__.py         # Flask app factory
│   │   ├── config.py           # Environment-specific configuration
│   │   ├── extensions.py       # Flask extension initialisation (DB, JWT, CORS, Bcrypt)
│   │   ├── logging.py          # Centralised logging configuration
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   ├── routes/             # API route blueprints
│   │   │   ├── auth.py         # Login and registration
│   │   │   ├── course.py       # Course CRUD
│   │   │   ├── module.py       # Module CRUD
│   │   │   ├── lesson.py       # Lesson CRUD
│   │   │   ├── quiz.py         # Quiz management and submission
│   │   │   ├── certificates.py # Certificate issuance and retrieval
│   │   │   ├── user.py         # User profile management
│   │   │   └── root.py         # Health check / root endpoint
│   │   ├── schemas/            # Marshmallow validation schemas
│   │   │   ├── auto.py         # Base auto-schema class
│   │   │   └── models.py       # Per-model schema definitions
│   │   └── decorators/         # Reusable middleware
│   │       └── schema.py       # @payload() validation decorator
│   ├── settings/
│   │   └── loader.py           # Environment-aware .env file loader
│   └── tests/
│       ├── conftest.py          # Pytest configuration and app fixture
│       ├── fixtures/            # Reusable test factories and DB setup
│       │   ├── database.py     # Schema creation and transactional sessions
│       │   ├── factories.py    # Model factory functions
│       │   ├── auth.py         # Authentication helpers
│       │   └── users.py        # User fixture generators
│       ├── models/             # Model-level unit tests
│       │   ├── test_courses.py
│       │   └── test_modules.py
│       └── routes/             # Route-level integration tests
│           └── test_auth.py
│
├── frontend/
│   ├── package.json            # Node.js dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   └── src/                    # React/Next.js source code
│       ├── app/                # Next.js app router pages
│       └── components/         # Reusable React components
│
└── README.md                   # This file
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/iamscd/endo.git
cd endo
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to the frontend directory (from the project root)
cd frontend

# Install dependencies
npm install
```

---

## Configuration

The backend uses environment-specific configuration managed through `.env` files and the `settings/loader.py` module.

### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-minimum-32-bytes

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here-minimum-32-bytes

# Database
DATABASE_URL=sqlite:///dev.db
```

**Important:** For production, use a strong, randomly generated secret key of at least 32 bytes. The `SECRET_KEY` and `JWT_SECRET_KEY` should be different values. Never commit `.env` files to version control.

### Configuration Classes

The `server/config.py` file defines three configuration classes:

- **`DevelopmentConfig`** — SQLite database, debug mode enabled, relaxed security settings
- **`TestingConfig`** — In-memory SQLite database, testing flag enabled
- **`ProductionConfig`** — PostgreSQL database URL from environment, debug disabled, strict security

The active configuration is selected based on the `FLASK_ENV` environment variable.

---

## Running the Application

### Running the Backend

The backend is a Flask API running on port 5000. Open a terminal and follow these steps:

**Step 1 — Navigate to the backend folder**
```bash
cd endo/backend
```

**Step 2 — Create a virtual environment**

This keeps Python dependencies isolated to this project.
```bash
python3 -m venv venv

# Mac / Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```
> Your terminal prompt should now show `(venv)` at the start.

**Step 3 — Install dependencies**
```bash
pip install -r requirements.txt
```

**Step 4 — Start the Flask server**
```bash
python app.py
```

You should see:
```
 * Serving Flask app 'server'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```
> **macOS note:** If port 5000 is already in use, go to **System Settings → General → AirDrop & Handoff → AirPlay Receiver** and turn it off.

---

### Running the Frontend

The frontend is a Next.js app running on port 3000. Open a **second terminal tab** (keep the backend running) and follow these steps:

**Step 1 — Navigate to the frontend folder**
```bash
cd endo/frontend
```

**Step 2 — Install dependencies**
```bash
npm install
```
> This may take a minute the first time.

**Step 3 — Start the dev server**
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15
  - Local:   http://localhost:3000
  - Ready in …s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials 

A pre-configured administrator account is available for testing and evaluation purposes:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | AdminPass123! |

> **Note:** This account has full administrator privileges, including the ability to create, edit, and delete courses, modules, lessons, and quiz questions.

---

## Testing

### Running the Test Suite

```bash
cd backend
source venv/bin/activate

# Run all tests with verbose output
python -m pytest tests -v
```

### Test Structure

The test suite is organised into three layers:

- **`tests/fixtures/`** — Reusable factories, database setup, and authentication helpers. Uses transactional sessions that roll back after each test for complete isolation.
- **`tests/models/`** — Model-level unit tests verifying database operations (CRUD) and entity relationships.
- **`tests/routes/`** — Route-level integration tests verifying API endpoint behaviour, authentication, authorisation, and error handling.

### What the Tests Cover

- User registration and authentication (success and failure cases)
- User profile retrieval and updates
- Course, module, and lesson CRUD operations
- Role-based access control (admin vs member permissions)
- Progress tracking and completion marking
- Quiz creation, retrieval, and submission
- Certificate issuance and retrieval
- Media upload and access control
- Input validation and error responses

### Adding New Tests

New tests should follow the existing pattern:

1. Create a test file in the appropriate directory (`tests/models/` or `tests/routes/`)
2. Use the existing fixtures from `tests/fixtures/` for database setup and authentication
3. Use the `transactional_session` fixture to ensure test isolation
4. Test both success and failure scenarios

Example:

```python
def test_create_resource_as_admin(self, client, admin_token):
    """Admin should be able to create a new resource."""
    response = client.post(
        "/api/resource",
        json={"title": "Test", "description": "Test description"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201

def test_create_resource_as_member(self, client, member_token):
    """Non-admin users should be rejected."""
    response = client.post(
        "/api/resource",
        json={"title": "Test", "description": "Test description"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 403
```

---

## Deployment

### Frontend (Render)

The frontend is deployed on [Render](https://render.com/). To deploy:

1. Connect your GitHub repository to Render
2. Create a new **Static Site** or **Web Service**
3. Set the root directory to `frontend/`
4. Set the build command to `npm run build`
5. Set the publish directory to `.next/` (or as required by your Next.js configuration)

### Backend

To deploy the backend to a cloud platform:

1. Set the required environment variables (`FLASK_ENV=production`, `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`)
2. Ensure the `DATABASE_URL` points to a production PostgreSQL instance
3. Set the start command to `python app.py`
4. The `settings/loader.py` module will automatically detect the production environment and load the appropriate configuration

### Database Migration

The application uses SQLAlchemy and is database-agnostic. To switch from SQLite to PostgreSQL:

1. Provision a PostgreSQL database
2. Set the `DATABASE_URL` environment variable to the PostgreSQL connection string (e.g., `postgresql://user:password@host:port/dbname`)
3. No code changes are required — SQLAlchemy handles the abstraction

---

## API Overview

All endpoints use JSON for request and response bodies. Protected endpoints require a valid JWT token in the `Authorization` header (`Bearer <token>`).

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Create a new user account | No |
| POST | `/api/login` | Authenticate and receive JWT | No |

### Courses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courses` | List all courses | Yes |
| POST | `/api/courses` | Create a course | Admin |
| PUT | `/api/courses/<id>` | Update a course | Admin |
| DELETE | `/api/courses/<id>` | Delete a course | Admin |

### Modules
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courses/<id>/modules` | List modules in a course | Yes |
| POST | `/api/modules` | Create a module | Admin |
| PUT | `/api/modules/<id>` | Update a module | Admin |
| DELETE | `/api/modules/<id>` | Delete a module | Admin |

### Lessons
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/modules/<id>/lessons` | List lessons in a module | Yes |
| POST | `/api/lessons` | Create a lesson | Admin |
| PUT | `/api/lessons/<id>` | Update a lesson | Admin |
| DELETE | `/api/lessons/<id>` | Delete a lesson | Admin |

### Quizzes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/lessons/<id>/quiz` | Get quiz for a lesson | Yes |
| POST | `/api/quiz` | Create a quiz question | Admin |
| PUT | `/api/quiz/<id>` | Update a quiz question | Admin |
| POST | `/api/quiz/<id>/submit` | Submit quiz answers | Yes |

### Progress
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/lessons/<id>/progress` | Mark lesson as complete | Yes |

### Certificates
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/certificates` | Get user's certificates | Yes |
| POST | `/api/certificates` | Issue a certificate | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/profile` | Get current user profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |

---

## Extending the System

The platform is designed with extensibility in mind. Below are guidelines for common extension tasks.

### Adding a New Database Model

1. Define the model in `server/models.py` using SQLAlchemy:

```python
class NewModel(database.Model):
    __tablename__ = "new_models"
    id = database.Column(database.String, primary_key=True, default=generate_uuid)
    title = database.Column(database.String, nullable=False)
    created_at = database.Column(database.DateTime, default=datetime.utcnow)
```

2. Create a Marshmallow schema in `server/schemas/models.py`:

```python
class NewModelSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.NewModel
```

3. Create a route blueprint in `server/routes/new_model.py` and register it in the app factory.

4. Write tests in `tests/models/` and `tests/routes/`.

### Adding a New API Endpoint

1. Create or modify a route file in `server/routes/`
2. Use the `@payload()` decorator for input validation:

```python
@blueprint.route("/new-endpoint", methods=["POST"])
@flask_jwt_extended.jwt_required()
@schema.payload(NewModelSchema)
def create_new_model():
    data = flask.g.payload
    # Business logic here
    return flask.jsonify(result), 201
```

3. Add role-based access control where needed by checking the current user's role.

### Adding New Quiz Question Types

The current quiz system uses a flexible JSON array for answer options. To add new question types (e.g., true/false, fill-in-the-blank):

1. Add a `question_type` field to the `LessonQuiz` model
2. Update the `LessonQuizSchema` to validate the new field
3. Adjust the frontend quiz component to render different question formats based on the type
4. Update the submission endpoint to validate answers according to the question type

### Adding a New Frontend Page

1. Create a new page file in `src/app/` following Next.js App Router conventions
2. Build reusable components in `src/components/`
3. Use the existing authentication context for protected pages
4. Make API calls to the backend using the existing fetch pattern with JWT token headers

---

## Known Issues

- **Deprecated `Query.get()` usage** — Several model queries use SQLAlchemy's `Query.get()` method, which is deprecated in favour of `Session.get()`. Does not affect current functionality but should be updated before upgrading SQLAlchemy.
- **Deprecated `datetime.utcnow()`** — Timestamps use `datetime.utcnow()`, which is deprecated in favour of timezone-aware datetime objects. Should be addressed for production deployment across time zones.
- **JWT secret key length** — The testing configuration uses a JWT secret key below the recommended minimum of 32 bytes. Production deployments must use a cryptographically strong secret of appropriate length.
- **Certificate frontend** — The backend certificate model and API endpoints are in place, but the frontend interface for viewing and downloading certificates is not yet complete.
- **Marshmallow coverage** — Input validation via Marshmallow schemas is implemented for authentication routes but has not yet been extended to all endpoints.

---

## Licence

This project was developed as coursework for CS3028/CS3528 at the University of Aberdeen. Please refer to the university's policies regarding the use and distribution of student work.
