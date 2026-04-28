import os
import server
import server.logging

logging = server.logging.get_logger(__name__)

# Create the Flask application
app = server.create_app()

def _maybe_init_db() -> None:
    flag = os.environ.get("INIT_DB_ON_STARTUP", "0")
    logging.warning("INIT_DB_ON_STARTUP flag value: '%s'", flag)
    if flag.strip().lower() in {"1", "true", "yes"}:
        logging.warning("Starting DB initialisation...")
        from server.create_db import main as init_db
        init_db()
        logging.warning("DB initialisation complete.")
    else:
        logging.warning("Skipping DB init.")

with app.app_context():
    _maybe_init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
