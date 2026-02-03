"""
Environment loader with safe fallback for deployment.
"""

# -- Import standard modules --
import os
import dotenv
import pathlib
import logging

logger = logging.getLogger("settings.loader")

# Absolute path to /backend directory
BASE_DIR = pathlib.Path(__file__).parent.parent.resolve()


def load_env(service_name: str) -> str:
    """
    Load environment variables from .env.<service_name>.<env> if present.
    If missing (common in production on Render), fall back to system env vars.

    :param service_name: Name of the service, e.g. "server"
    :return: The active FLASK_ENV value.
    """
    env = os.environ.get("FLASK_ENV", "development")
    filename = f".env.{service_name}.{env}"
    env_path = BASE_DIR / filename

    if env_path.exists():
        dotenv.load_dotenv(dotenv_path=env_path, override=True)
        logger.info(f"Loaded env file: %s", env_path)
    else:
        logger.warning(
            "Env file not found (%s). Using system environment variables only.",
            env_path,
        )

    return env