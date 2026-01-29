"""
TODO: Write docstring here
"""

# -- Import pytest --
import pytest

# -- Import test modules --
import tests.fixtures.factories

# -- Import server models --
from server.models import Module


def test_module_insert(create_module):
    """TODO: Write docstring here"""
    module = create_module(title="test-module-insert")
    assert module.id is not None


def test_module_query(create_module):
    """TODO: Write docstring here"""
    module = create_module(title="test-module-query")
    fetched_module = Module.query.filter_by(title="test-module-query").first()

    assert fetched_module is not None
    assert fetched_module.id == module.id


# -- general auth --


def test_create_module_requires_auth(client, create_course):
    """TODO: Write docstring here"""
    course = create_course()
    resp = client.post(
        "/modules",
        json={"title": "Test", "course_id": course.id},
    )
    assert resp.status_code in (401, 422)


def test_get_module_requires_public(client, create_module):
    """TODO: Write docstring here"""
    module = create_module()
    resp = client.get(f"/modules/{module.id}")
    assert resp.status_code == 200


def test_delete_module_requires_auth(client, create_module):
    """TODO: Write docstring here"""
    module = create_module()
    resp = client.delete(
        f"/modules/{module.id}",
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
def test_create_module_permissions(
    client, create_course, create_user, login_for_token, role, expected_status
):
    """TODO: Write docstring here"""
    course = create_course()

    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.post(
        "/modules",
        json={"title": "Test", "course_id": course.id},
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
def test_get_module_permissions(
    client, create_module, create_user, login_for_token, role, expected_status
):
    """TODO: Write docstring here"""
    module = create_module()
    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.get(
        f"/modules/{module.id}",
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
def test_get_modules_permissions(
    client,
    create_course,
    create_module,
    create_user,
    login_for_token,
    role,
    expected_status,
):
    """TODO: Write docstring here"""
    course = create_course()
    modules = [create_module(title=f"test-{i}", course_id=course.id) for i in range(5)]

    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.get(
        f"/courses/{course.id}/modules",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status
    if expected_status == 200:
        assert len(resp.get_json()) == 5


@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 403),
    ],
)
def test_delete_module_permissions(
    client, create_module, create_user, login_for_token, role, expected_status
):
    """TODO: Write docstring here"""
    module = create_module()

    user = create_user(role=role)

    token = login_for_token(user.email, tests.fixtures.factories.DEFAULT_TEST_PASSWORD)

    resp = client.delete(
        f"/modules/{module.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status
