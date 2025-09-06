# TalentHub

TalentHub is a full-stack web application designed to streamline the recruitment process by connecting job applicants, employers, and administrators.

## Tech Stack

**Client:** React, React Router, Axios, Vite

**Server:** Python, Django, Django REST Framework

**Database:** SQLite (default), PostgreSQL (supported via psycopg2)

## Features

- **Role-Based Access:** Separate user experiences for Applicants, Employers, and Administrators.
- **Job Management:** Create, view, update, and delete job postings.
- **Application Tracking:** Allows applicants to apply for jobs and employers to manage applications.
- **RESTful API:** A comprehensive backend API for managing users, jobs, and applications.

## API Reference

The base URL for the API is `/api/`.

#### User Management

```http
GET /api/admin/users/
POST /api/admin/users/
```

```http
GET /api/admin/users/${id}/
PUT /api/admin/users/${id}/
DELETE /api/admin/users/${id}/
```

#### Job Management

```http
GET /api/jobs/
POST /api/jobs/
```

```http
GET /api/jobs/${id}/
PUT /api/jobs/${id}/
DELETE /api/jobs/${id}/
```

#### Application Management

```http
GET /api/applications/
POST /api/applications/
```

```http
GET /api/applications/${id}/
PUT /api/applications/${id}/
DELETE /api/applications/${id}/
```

## Run Locally

Clone the project:

```bash
git clone <https://github.com/nebiyuu1954/TalentHub.git>
cd TalentHub
```

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies using Pipenv:**
    ```bash
    pipenv install
    pipenv shell
    ```

3.  **Apply database migrations:**
    ```bash
    python talenthub_backend/manage.py migrate
    ```

4.  **Start the backend server:**
    ```bash
    python talenthub_backend/manage.py runserver
    ```
    The backend will be running on `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend/talenthub_frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run start
    ```
    The frontend will be running on `http://localhost:5173`.

## Authors

- [@NEBIYU](https://www.github.com/nebiyuu1954)
