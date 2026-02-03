# API Call List - Backend Endpoints Reference

**Version:** 1.0
**Date:** 2025-11-04
**Base URL:** `http://127.0.0.1:5000`

This document provides a reference for all available API endpoints, required headers, request payloads, and sample responses for frontend developers.

---

## Authentication

### 1. Login

* **Endpoint:** `/auth/login`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**

```json
{
  "email": "member@example.com",
  "password": "member123"
}
```

* **Success Response (200):**

```json
{
  "access_token": "<JWT_TOKEN>"
}
```

* **Notes:** Use `access_token` in Authorization headers for protected routes.

---

### 2. Protected Routes Header

* **Header format:**

```
Authorization: Bearer <JWT_TOKEN>
```

---

## User Profile

### 1. Get User Profile

* **Endpoint:** `/api/user/profile`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200):**

```json
{
  "name": "Member User",
  "email": "member@example.com",
  "date_joined": "2025-11-04",
  "role": "member",
  "learning_progress": {
    "completed_lessons": 1,
    "total_lessons": 2,
    "progress_percent": 50.0
  },
  "certificate_status": "not earned"
}
```


---

## Courses

### 1. Create Course (Admin Only)

* **Endpoint:** `/courses`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Body (JSON):**

```json
{
  "title": "PowerShell Test Course",
  "description": "Created via PowerShell"
}
```

* **Success Response (201):**

```json
{
  "course_id": 3,
  "message": "Course created"
}
```

---

## Lessons

### 1. Mark Lesson Progress

* **Endpoint:** `/lessons/<lesson_id>/progress`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Body:** None required
* **Success Response (200):**

```json
{
  "is_completed": true
}
```

* **Notes:** Marks the lesson as completed for the logged-in user.

---

## Quizzes


**Get quizzes for a lesson**  
`GET /lessons/:lesson_id/quizzes`  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "options": {"A":"Paris","B":"Berlin","C":"Madrid","D":"Rome"}
  }
]
```

**Create a quiz (admin only)**  
`POST /quizzes`  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "lesson_id": 1,
  "question": "What is 2+2?",
  "option_a":"3","option_b":"4","option_c":"5","option_d":"6",
  "correct_option":"B"
}
```
**Response:**
```json
{"message":"Quiz created","quiz_id":5}
```


---

## Certificates


#### will fix later probably
Certificates
1. Get certificates for a user

Endpoint: /users/<user_id>/certificates

Method: GET

Headers: Authorization: Bearer <JWT_TOKEN>

**Success Response (200):`

2. Create a certificate (Admin Only)

Endpoint: /certificates

Method: POST

Headers: Authorization: Bearer <ADMIN_JWT_TOKEN>

**Body (JSON):`

3. Get a specific certificate by code

Endpoint: /certificates/<certificate_code>

Method: GET

Headers: Authorization: Bearer <JWT_TOKEN>

**Success Response (200):`



4. Revoke/Delete a certificate (Admin Only)

Endpoint: /certificates/<certificate_id>

Method: DELETE

Headers: Authorization: Bearer <ADMIN_JWT_TOKEN>

**Success Response (200):`

## Notes 

1. Always include the `Authorization` header for protected endpoints.
2. Base URL for backend is different from frontend dev server:

   * Frontend: `http://localhost:3000`
   * Backend: `http://127.0.0.1:5000`
3. Handle `400` and `401` errors gracefully on the frontend (invalid/expired token, missing parameters).
4. Use `CORS` is enabled, so requests from `http://localhost:3000` should succeed.
