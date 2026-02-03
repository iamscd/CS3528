"""
TODO: Write docstring here
"""
# -- Import pytest --
import pytest

# -- Import standard modules --
import sys
import os

# Ensure backend/ is on path (pytest quirk)
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# -- Import settings package --
import server
import server.config
import server.models

# -- Modules exclusive to package server --

pytest_plugins = [
    "tests.fixtures.database",
    "tests.fixtures.factories",
    "tests.fixtures.auth",
    "tests.fixtures.users",
]

@pytest.fixture(scope="session")
def test_app() -> server.flask.Flask:
    """Create an isolated Flask app for testing with an in-memory database.

    :return server.Flask: the test Flask app
    """
    return server.create_app(server.config.TestingConfig)


@pytest.fixture()
def client(test_app):
    """TODO: Write docstring here
    """
    return test_app.test_client()