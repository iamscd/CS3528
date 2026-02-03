"""
TODO: Write docstring here
"""

# -- Import flask --
import flask
import flask_jwt_extended

# -- Import required server modules --
import server.extensions

# -- Import server models --
from server.models import Course, Module

blueprint = flask.Blueprint("module", __name__)


# GET modules by course
@blueprint.route("/courses/<int:course_id>/modules", methods=["GET"])
def get_modules(course_id):
    modules = (
        Module.query.filter_by(course_id=course_id).order_by(Module.order_index).all()
    )
    return flask.jsonify(
        [
            {
                "id": m.id,
                "course_id": m.course_id,
                "title": m.title,
                "description": m.description,
                "order_index": m.order_index,
            }
            for m in modules
        ]
    ), 200


# POST create module (admin only)
@blueprint.route("/modules", methods=["POST"])
@flask_jwt_extended.jwt_required()
def create_module():
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can create modules"}), 403

    data = flask.request.get_json(silent=True) or {}
    title = data.get("title")
    course_id = data.get("course_id")

    if not title or not isinstance(title, str):
        return flask.jsonify(
            {"message": 'Field "title" is required and must be a string'}
        ), 400

    if not course_id or not Course.query.get(course_id):
        return flask.jsonify({"error": "Invalid or missing course_id"}), 400

    description = data.get("description")
    order_index = data.get("order_index") or 0

    module = Module(
        title=title.strip(),
        course_id=course_id,
        description=description,
        order_index=order_index,
    )

    server.extensions.database.session.add(module)
    server.extensions.database.session.commit()

    return flask.jsonify({"message": "Module created", "module_id": module.id}), 200


# GET single module
@blueprint.route("/modules/<int:module_id>", methods=["GET"])
def get_module(module_id):
    module = Module.query.get(module_id)
    if not module:
        return flask.jsonify({"message": "Module not found"}), 404

    return flask.jsonify(
        {
            "id": module.id,
            "course_id": module.course_id,
            "title": module.title,
            "description": module.description,
            "order_index": module.order_index,
        }
    ), 200


# PUT update module (admin only)
@blueprint.route("/modules/<int:module_id>", methods=["PUT"])
@flask_jwt_extended.jwt_required()
def update_module(module_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can update modules"}), 403

    module = Module.query.get(module_id)
    if not module:
        return flask.jsonify({"message": "Module not found"}), 404

    data = flask.request.get_json(silent=True) or {}

    title = data.get("title")
    description = data.get("description")
    order_index = data.get("order_index")

    if title is not None:
        if not isinstance(title, str) or not title.strip():
            return flask.jsonify(
                {"message": 'Field "title" must be a non-empty string'}
            ), 400
        module.title = title.strip()

    if description is not None:
        module.description = description

    if order_index is not None:
        try:
            module.order_index = int(order_index)
        except (TypeError, ValueError):
            return flask.jsonify({"message": "order_index must be an integer"}), 400

    server.extensions.database.session.commit()
    return flask.jsonify({"message": "Module updated"}), 200


# DELETE module (admin only)
@blueprint.route("/modules/<int:module_id>", methods=["DELETE"])
@flask_jwt_extended.jwt_required()
def delete_module(module_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can delete modules"}), 403

    module = Module.query.get(module_id)
    if not module:
        return flask.jsonify({"message": "Module not found"}), 404

    server.extensions.database.session.delete(module)
    server.extensions.database.session.commit()
    return flask.jsonify({"message": "Module deleted"}), 200
