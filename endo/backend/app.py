"""TODO: Write docstring here
"""
import os
import server
import server.logging

# Create the Flask application
app = server.create_app()
logging = server.logging.get_logger(__name__)

def _maybe_init_db() -> None:
    """
    Run the database initialisation if enabled.

    This calls server.create_db.main(), which creates all tables using
    SQLAlchemy. It is safe to run multiple times.
    """
    flag = os.environ.get("INIT_DB_ON_STARTUP", "0").lower()
    if flag in {"1", "true", "yes"}:
        try:
            from server.create_db import main as init_db
            init_db()
        except Exception as exc:  # noqa: BLE001
            # Don't crash the app if DB init fails; just log it.
            logging.warning("Database init failed or was skipped: %s", exc)

# Initialise the DB on boot (Render will execute this when starting the service)
_maybe_init_db()


# If you ever run this locally via `python app.py`
if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)