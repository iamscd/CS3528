"""TODO: Write docstring here
"""
# -- Import standard libraries --
import pytest

@pytest.fixture
def admin_user(create_user):
    """TODO: Write docstring here
    """
    return create_user(
        name="Admin User",
        role="admin"
    )    
    
@pytest.fixture
def member_user(create_user):
    """TODO: Write docstring here
    """
    return create_user(
        name="Member User",
        role="member"
    )
