"""
TODO: Write docstring here
"""

# -- Import pytest --
import pytest

# -- Import test modules --
import tests.fixtures.factories

# -- Import server models --
from server.models import User


def test_register_creates_user_success(client, transactional_session):
    """Register with valid data should create a new user in the database."""
    email = "register-success@example.com"
    payload = {
        "name": "Register Success",
        "email": email,
        "password": tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    }

    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 201

    # Verify user persisted
    created = User.query.filter_by(email=email).first()
    assert created is not None
    assert created.name == "Register Success"
    # Password should be hashed, not stored in plaintext
    assert created.password_hash != tests.fixtures.factories.DEFAULT_TEST_PASSWORD


def test_register_missing_fields_returns_400(client, transactional_session):
    """Register with missing required fields should return 400 and error details."""
    resp = client.post("/auth/register", json={})
    assert resp.status_code == 400

    data = resp.get_json()
    # Our payload decorator wraps marshmallow errors under "errors"
    assert isinstance(data, dict)
    assert "errors" in data
    # At minimum, email and password should be reported as missing
    errors = data["errors"]
    assert "email" in errors or "password" in errors


def test_register_duplicate_email_rejected(client, transactional_session, create_user):
    """Register with an email that already exists should be rejected."""
    email = "duplicate@example.com"

    # Pre-create a user with this email
    create_user(email=email)

    payload = {
        "name": "Duplicate User",
        "email": email,
        "password": tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    }

    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 400

    data = resp.get_json()
    assert isinstance(data, dict)
    assert "errors" in data
    # AutoSchema unique check should attach an error to the email field
    assert "email" in data["errors"]


def test_login_success_returns_token(client, transactional_session, create_user):
    """Valid credentials should return a JWT access token."""
    password = tests.fixtures.factories.DEFAULT_TEST_PASSWORD
    user = create_user(email="login-success@example.com")

    resp = client.post(
        "/auth/login",
        json={"email": user.email, "password": password},
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, dict)
    assert "access_token" in data
    assert isinstance(data["access_token"], str)
    assert data["access_token"]


def test_login_wrong_password_returns_401(client, transactional_session, create_user):
    """Wrong password should return 401 with an error message."""
    user = create_user(email="wrong-password@example.com")

    resp = client.post(
        "/auth/login",
        json={"email": user.email, "password": "not-the-right-password"},
    )

    assert resp.status_code == 401
    data = resp.get_json()
    assert isinstance(data, dict)
    assert "message" in data


def test_login_unknown_email_returns_401(client, transactional_session):
    """Login with an unknown email should return 401."""
    resp = client.post(
        "/auth/login",
        json={
            "email": "does-not-exist@example.com",
            "password": tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
        },
    )

    assert resp.status_code == 401
    data = resp.get_json()
    assert isinstance(data, dict)
    assert "message" in data
