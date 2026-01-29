"""
TODO: Write docstring here
"""

# -- Import flask --
import uuid

import flask_bcrypt

# -- Import pytest --
import pytest

# -- Modules exclusive to package server --
import server.models as models

DEFAULT_TEST_PASSWORD = "password"


@pytest.fixture(scope="function")
def create_user(transactional_session):
    """TODO: Write docstring here"""

    def _create_user(
        name="test-user",
        email=None,
        password=None,
        password_hash=None,
        role="member",
        **kwargs,
    ):
        """TODO: Write docstring here"""
        if password_hash is None:
            plaintext_password = password or DEFAULT_TEST_PASSWORD
            password_hash = flask_bcrypt.generate_password_hash(
                plaintext_password
            ).decode("utf-8")

        user = models.User(
            name=name,
            email=email or f"user_{uuid.uuid4()}@example.com",
            password_hash=password_hash
            or flask_bcrypt.generate_password_hash(
                password or DEFAULT_TEST_PASSWORD
            ).decode("utf-8"),
            role=role,
            **kwargs,
        )

        transactional_session.add(user)
        transactional_session.commit()

        return user

    return _create_user


@pytest.fixture(scope="function")
def create_course(transactional_session):
    """TODO: Write docstring here"""

    def _create_course(
        title="test-course", description="test-desc", created_by=0, **kwargs
    ):
        """TODO: Write docstring here"""
        course = models.Course(
            title=title, description=description, created_by=created_by, **kwargs
        )

        transactional_session.add(course)
        transactional_session.commit()

        return course

    return _create_course


@pytest.fixture(scope="function")
def create_module(transactional_session, create_course):
    """TODO: Write docstring here"""

    def _create_module(
        title="test-module",
        course_id=None,
        description="test-desc",
        order_index=0,
        **kwargs,
    ):
        """TODO: Write docstring here"""

        if course_id is None:
            course = create_course()
            course_id = course.id

        module = models.Module(
            title=title,
            course_id=course_id,
            description=description,
            order_index=order_index,
        )

        transactional_session.add(module)
        transactional_session.commit()

        return module

    return _create_module


@pytest.fixture(scope="function")
def create_lesson(transactional_session, create_module):
    """TODO: Write docstring here"""

    def _create_lesson(
        title="test-lesson",
        module_id=None,
        content_type="text",
        text_content="test-desc",
        **kwargs,
    ):
        """TODO: Write docstring here"""

        if module_id is None:
            module = create_module()
            module_id = module.id

        lesson = models.Lesson(
            title=title,
            module_id=module_id,
            content_type=content_type,
            text_content=text_content,
            **kwargs,
        )

        transactional_session.add(lesson)
        transactional_session.commit()

        return lesson

    return _create_lesson


@pytest.fixture(scope="function")
def create_certificate(transactional_session):
    """TODO: Write docstring here"""

    def _create_certificate(
        user_id=0,
        course_id=0,
        title="test-certificate",
        certificate_code="test-code",
        **kwargs,
    ):
        """TODO: Write docstring here"""
        certificate = models.Certificate(
            user_id=user_id,
            course_id=course_id,
            title=title,
            certificate_code=certificate_code,
            **kwargs,
        )

        transactional_session.add(certificate)
        transactional_session.commit()

        return certificate

    return _create_certificate
