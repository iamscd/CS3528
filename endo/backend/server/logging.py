"""
TODO: Write docstring here
"""

# -- Import standard modules --
import logging
import sys

# -- Import server config --
import server.config

# TODO: Implement indepth logging across other modules

def configure() -> None:
    """Configure logging of the server.

    Note: This should be called once during app initialization.

    :return: None
    """
    
    logger = logging.getLogger(server.config.SERVICE_NAME)
    
    # Clear existing handlers (due to possible flask reloading)
    for handler in logging.handlers[:]:
        logging.root.removeHandler(handler)

    # Logging level from current server config
    level = logging.DEBUG if server.config.current.DEBUG else logging.INFO
    
    # Log message format (padded for alignment)
    formatter = logging.Formatter(
        "%(levelname)-8s | %(asctime)s | %(name)-30s | %(message)s",
        "%Y-%m-%d %H:%M:%S",
    )

    # Console output handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.setLevel(level)
    
    # Configure server logger
    logger.addHandler(handler)

    # Incase we change the logger independance later
    logger.propagate = True
   
    return None

def get_logger(name: str | None = None) -> logging.Logger:
    """Retrieve a logger for the server.

    :param str | None name: namespace name for the logger, defaults to None
    :return logging.Logger: the logger instance
    """
    if name is None:
        return logging.getLogger(server.config.SERVICE_NAME)
    elif name.startswith(server.config.SERVICE_NAME):
        return logging.getLogger(name)
    return logging.getLogger(f"{server.config.SERVICE_NAME}.{name}")