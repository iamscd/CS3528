"""
TODO: Write docstring here
"""

# -- Import pytest --
import pytest

# -- Import test modules --
import tests.fixtures.factories

# -- Import server models --
from server.models import User

# -- database tests --


def test_user_insert(transactional_session, create_user):
    """Ensure a user can be inserted into the database."""
    user = create_user(name="test-user-insert")
    assert user.id is not None


def test_user_query(transactional_session, create_user):
    """Ensure a user can be queried from the database."""
    user = create_user(name="test-user-query")
    fetched_user = User.query.filter_by(name="test-user-query").first()

    assert fetched_user is not None
    assert fetched_user.id == user.id


# -- general auth for profile --


def test_get_profile_requires_auth(client):
    """GET /api/user/profile should require authentication."""
    resp = client.get("/api/user/profile")
    assert resp.status_code in (401, 422)


def test_update_profile_requires_auth(client):
    """PUT /api/user/profile should require authentication."""
    resp = client.put(
        "/api/user/profile",
        json={"name": "New Name"},
    )
    assert resp.status_code in (401, 422)


# -- profile behaviour --


def test_get_profile_returns_name_and_progress(
    client,
    create_user,
    login_for_token,
):
    """Authenticated user should receive profile with name and learning_progress."""
    user = create_user(name="Profile User")

    token = login_for_token(
        user.email,
        tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    )

    resp = client.get(
        "/api/user/profile",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == 200
    data = resp.get_json()

    assert "name" in data
    assert data["name"] == user.name
    assert "learning_progress" in data
    assert isinstance(data["learning_progress"], dict)


def test_update_profile_allows_name_and_password(
    client,
    create_user,
    login_for_token,
):
    """Authenticated user should be able to update name and password."""
    user = create_user(name="Old Name")

    token = login_for_token(
        user.email,
        tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    )

    resp = client.put(
        "/api/user/profile",
        json={"name": "New Name", "password": "new-password"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get("message") == "Profile updated successfully"

    # Reload user from the database to confirm the name was updated
    updated_user = User.query.get(user.id)
    assert updated_user.name == "New Name"
    # We don't assert directly on password_hash value, just that it changed
    assert updated_user.password_hash != user.password_hash
