"""
Authentication and permission decorators.
Explicit import style for consistency with the project.
"""

import functools

import flask
import flask_jwt_extended


def admin(fn):
    """
    Require that the authenticated user has role='admin'.
    Must be used under @flask_jwt_extended.jwt_required().
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        claims = flask_jwt_extended.get_jwt()
        role = claims.get("role")

        if role != "admin":
            return flask.jsonify({"message": "Admin access required"}), 403

        return fn(*args, **kwargs)

    return wrapper


def user(fn):
    """
    Require a valid JWT identity (any authenticated user).
    Mainly useful when you don't want to repeat jwt_required() everywhere.
    """

    @functools.wraps(fn)
    @flask_jwt_extended.jwt_required()
    def wrapper(*args, **kwargs):
        # If jwt_required passed, identity is already valid.
        _user_id = flask_jwt_extended.get_jwt_identity()
        return fn(*args, **kwargs)

    return wrapper
