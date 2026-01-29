"""
TODO: Write docstring here
"""
# -- Import pytest --
import pytest

# -- Import database modules --
import sqlalchemy.orm

# -- Modules exclusive to package server --
from server.extensions import database

@pytest.fixture(scope="session")
def database_schema(test_app):
    """TODO: Write docstring here
    """
    with test_app.app_context():
        database.create_all()
    
        yield

        database.drop_all()
        
@pytest.fixture(scope="function")
def transactional_session(database_schema):
    """TODO: Write docstring here
    """
    engine = database.engine
    connection = engine.connect()
    transaction = connection.begin()

    # create bound session
    session = sqlalchemy.orm.sessionmaker(bind=connection)()

    # globalise session for Flask-SQLAlchemy database.session
    old_bind = database.session.bind
    database.session.bind = connection

    try:
        yield session

    finally:
        # roll back and close connections
        session.close()
        database.session.bind = old_bind
        transaction.rollback()
        connection.close()

