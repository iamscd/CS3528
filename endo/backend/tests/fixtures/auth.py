# -- Import pytest --
import pytest

@pytest.fixture
def login_for_token(client):
    def _login(email: str, password: str) -> str:
        response = client.post(
            "auth/login",
            json={"email": email, "password": password},
        )

        assert response.status_code == 200, "Login failed in test setup"

        return response.get_json()["access_token"]

    return _login

