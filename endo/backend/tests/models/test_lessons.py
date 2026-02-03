"""
TODO: Write docstring here
"""

# -- Import pytest --
import pytest

# -- Import test modules --
import tests.fixtures.factories

# -- Import server models --
from server.models import Lesson

# -- database tests --


def test_lesson_insert(create_lesson):
    """Ensure a Lesson can be created and has an ID."""
    lesson = create_lesson(title="test-lesson-insert")
    assert lesson.id is not None


def test_lesson_query(create_lesson):
    """Ensure a created Lesson can be queried by title."""
    lesson = create_lesson(title="test-lesson-query")
    fetched = Lesson.query.filter_by(title="test-lesson-query").first()

    assert fetched is not None
    assert fetched.id == lesson.id


# -- general auth --


def test_create_lesson_requires_auth(client, create_module):
    """Creating a lesson without authentication should be rejected."""
    module = create_module()
    resp = client.post(
        "/lessons",
        json={
            "title": "Test lesson",
            "module_id": module.id,
            "content_type": "text",
            "text_content": "Example",
        },
    )
    assert resp.status_code in (401, 422)


def test_mark_lesson_complete_requires_auth(client, create_lesson):
    """Marking lesson complete without authentication should be rejected."""
    lesson = create_lesson()
    resp = client.post(f"/lessons/{lesson.id}/progress")
    assert resp.status_code in (401, 422)


# -- role / permission tests --


@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 403),
    ],
)
def test_create_lesson_permissions(
    client, create_module, create_user, login_for_token, role, expected_status
):
    """Only admins should be allowed to create lessons."""
    module = create_module()
    user = create_user(role=role)

    token = login_for_token(
        user.email,
        tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    )

    resp = client.post(
        "/lessons",
        json={
            "title": "Perm test lesson",
            "module_id": module.id,
            "content_type": "text",
            "text_content": "Example",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status


def test_get_lessons_auth(client, create_module, create_lesson):
    """Listing lessons for a module should be not publicly accessible."""
    module = create_module()
    # create a few lessons bound to this module
    for i in range(3):
        create_lesson(title=f"public-lesson-{i}", module_id=module.id)

    resp = client.get(f"/modules/{module.id}/lessons")

    assert resp.status_code == 401



@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 200),
    ],
)
def test_mark_lesson_complete_permissions(
    client, create_lesson, create_user, login_for_token, role, expected_status
):
    """Any authenticated user should be able to mark a lesson complete."""
    lesson = create_lesson()
    user = create_user(role=role)

    token = login_for_token(
        user.email,
        tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    )

    resp = client.post(
        f"/lessons/{lesson.id}/progress",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status
    if expected_status == 200:
        body = resp.get_json()
        assert body is not None
        assert body.get("is_completed") is True
