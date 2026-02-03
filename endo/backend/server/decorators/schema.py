"""
Helpers for validating request payloads against Marshmallow schemas.
"""

import functools

import flask
import marshmallow


def payload(schema_class):
    """Validate request JSON against the given Marshmallow schema.

    Usage:
        @blueprint.route("/courses", methods=["POST"])
        @flask_jwt_extended.jwt_required()
        @payload_schema(CourseSchema)
        def create_course():
            data = flask.g.payload
            ...
    """

    def decorator(view_function):
        @functools.wraps(view_function)
        def wrapper(*args, **kwargs):
            raw_json = flask.request.get_json(silent=True)

            if raw_json is None:
                return (
                    flask.jsonify(
                        {"message": "Request body must be valid JSON.", "errors": {}}
                    ),
                    400,
                )

            schema = schema_class()

            try:
                validated_data = schema.load(raw_json)
            except marshmallow.ValidationError as error:
                return (
                    flask.jsonify(
                        {
                            "message": "Payload validation failed.",
                            "errors": error.messages,
                        }
                    ),
                    400,
                )

            # Make validated data available to the view
            flask.g.payload = validated_data

            return view_function(*args, **kwargs)

        return wrapper

    return decorator
