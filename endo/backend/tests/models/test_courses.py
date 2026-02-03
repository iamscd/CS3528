"""
TODO: Write docstring here
"""

# -- Import pytest --
import pytest

# -- Import standard modules --
# -- Import test modules --
import tests.fixtures.factories

# -- Import server models --
from server.models import Course


def test_course_insert(transactional_session, create_course):
    """TODO: Write docstring here"""
    course = create_course(title="test-course-insert")
    assert course.id is not None


def test_course_query(transactional_session, create_course):
    """TODO: Write docstring here"""
    course = create_course(title="test-course-query")
    fetched_course = Course.query.filter_by(title="test-course-query").first()

    assert fetched_course is not None
    assert fetched_course.id == course.id


# -- general auth --


def test_create_course_requires_auth(client):
    """TODO: Write docstring here"""
    resp = client.post(
        "/courses",
        json={"title": "Test", "description": "Desc"},
    )
    assert resp.status_code in (401, 422)


def test_get_course_requires_public(client):
    """TODO: Write docstring here"""
    resp = client.get("/courses")
    assert resp.status_code == 200


def test_delete_course_requires_auth(client, create_course):
    """TODO: Write docstring here"""
    course = create_course()
    resp = client.delete(
        f"/courses/{course.id}",
    )
    assert resp.status_code in (401, 422)


# -- role auth --
@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 403),
    ],
)
def test_create_course_permissions(
    client, create_user, login_for_token, role, expected_status
):
    """TODO: Write docstring here"""
    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.post(
        "/courses",
        json={"title": "Test", "description": "Desc"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status


@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 200),
    ],
)
def test_get_course_permissions(
    client, create_user, login_for_token, role, expected_status
):
    """TODO: Write docstring here"""
    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.get(
        "/courses",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status


@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 403),
    ],
)
def test_delete_course_permissions(
    client, create_course, create_user, login_for_token, role, expected_status
):
    """TODO: Write docstring here"""
    course = create_course()

    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.delete(
        f"/courses/{course.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status
