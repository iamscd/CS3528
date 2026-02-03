"""
TODO: Write docstring here
"""

# -- Import pytest --
import pytest

# -- Import test modules --
import tests.fixtures.factories

# -- Import server models --
from server.models import Certificate

# -- database tests --


def test_certificate_insert(transactional_session, create_certificate):
    """Ensure a certificate can be inserted into the database."""
    certificate = create_certificate(title="test-certificate-insert")
    assert certificate.id is not None


def test_certificate_query(transactional_session, create_certificate):
    """Ensure a certificate can be queried from the database."""
    certificate = create_certificate(title="test-certificate-query")
    fetched_certificate = Certificate.query.filter_by(
        title="test-certificate-query"
    ).first()

    assert fetched_certificate is not None
    assert fetched_certificate.id == certificate.id


# -- general auth --


def test_issue_certificate_requires_auth(client, create_user, create_course):
    """Issuing a certificate should require authentication."""
    student = create_user()
    course = create_course()

    resp = client.post(
        "/certificates",
        json={"user_id": student.id, "course_id": course.id},
    )

    # Depending on JWT configuration this may be 401 or 422
    assert resp.status_code in (401, 422)


def test_get_certificate_requires_auth(client, create_certificate):
    """Fetching a certificate should require authentication."""
    certificate = create_certificate()
    resp = client.get(f"/certificates/{certificate.user_id}")

    assert resp.status_code in (401, 422)


# -- role auth --


@pytest.mark.parametrize(
    "role, expected_status",
    [
        ("admin", 200),
        ("member", 403),
    ],
)
def test_issue_certificate_permissions(
    client,
    create_user,
    create_course,
    login_for_token,
    role,
    expected_status,
):
    """Only admins should be allowed to issue certificates."""
    # student who will receive the certificate
    student = create_user(role="member")
    course = create_course()

    # acting user who is calling the endpoint
    actor = create_user(role=role)

    token = login_for_token(
        actor.email,
        tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    )

    resp = client.post(
        "/certificates",
        json={"user_id": student.id, "course_id": course.id},
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
def test_get_certificate_permissions(
    client,
    create_user,
    create_course,
    create_certificate,
    login_for_token,
    role,
    expected_status,
):
    """Any authenticated user should be able to fetch a certificate."""
    student = create_user(role="member")
    course = create_course()
    certificate = create_certificate(user_id=student.id, course_id=course.id)

    actor = create_user(role=role)

    token = login_for_token(
        actor.email,
        tests.fixtures.factories.DEFAULT_TEST_PASSWORD,
    )

    resp = client.get(
        f"/certificates/{student.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == expected_status

    if expected_status == 200:
        data = resp.get_json()
        # Match the JSON shape your route returns
        assert data.get("certificate_id") == certificate.id
        assert data.get("user_id") == certificate.user_id
        assert data.get("course_id") == certificate.course_id
