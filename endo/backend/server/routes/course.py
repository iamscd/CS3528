"""
Course routes.
"""

import flask
import flask_jwt_extended

import server.extensions
import server.media
from server.models import Course

blueprint = flask.Blueprint("course", __name__)


def _request_data() -> dict:
    """Support JSON and multipart form payloads."""
    if flask.request.is_json:
        return flask.request.get_json(silent=True) or {}
    return flask.request.form.to_dict()


def _serialise_course(course: Course) -> dict:
    """Build a consistent API payload for a course."""
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "image_url": server.media.build_media_url(course.thumbnail),
        "created_at": course.created_at.isoformat(),
        "created_by": course.created_by,
    }


@blueprint.route("/courses", methods=["GET"])
def get_courses():
    courses = Course.query.all()
    return flask.jsonify([_serialise_course(course) for course in courses]), 200


@blueprint.route("/courses", methods=["POST"])
@flask_jwt_extended.jwt_required()
def create_course():
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Admin access is  required"}), 403

    data = _request_data()
    title = data.get("title")
    if not title or not isinstance(title, str):
        return flask.jsonify({"message": "A valid title is required"}), 400

    image_path = data.get("image_url")
    image_file = flask.request.files.get("image")
    if image_file and image_file.filename:
        try:
            image_path, _ = server.media.save_upload(
                image_file,
                expected_kind="image",
                subdir="course-images",
            )
        except ValueError as exc:
            return flask.jsonify({"message": str(exc)}), 400

    course = Course(
        title=title.strip(),
        description=data.get("description", ""),
        thumbnail=image_path,
        created_by=flask_jwt_extended.get_jwt_identity(),
    )

    server.extensions.database.session.add(course)
    server.extensions.database.session.commit()

    return (
        flask.jsonify(
            {
                "message": "Course created",
                "course_id": course.id,
                "image_url": server.media.build_media_url(course.thumbnail),
            }
        ),
        200,
    )


@blueprint.route("/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return flask.jsonify({"message": "Course not found"}), 404

    return flask.jsonify(_serialise_course(course)), 200


@blueprint.route("/courses/<int:course_id>", methods=["PUT"])
@flask_jwt_extended.jwt_required()
def update_course(course_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can update the courses"}), 403

    course = Course.query.get(course_id)
    if not course:
        return flask.jsonify({"message": "Course is not found"}), 404

    data = _request_data()
    title = data.get("title")
    description = data.get("description")
    image_url = data.get("image_url")
    image_file = flask.request.files.get("image")

    if title is not None:
        if not isinstance(title, str) or not title.strip():
            return flask.jsonify({"message": 'Field "title" must be a non-empty string'}), 400
        course.title = title.strip()

    if description is not None:
        course.description = description

    if image_url is not None:
        course.thumbnail = image_url

    if image_file and image_file.filename:
        try:
            stored_path, _ = server.media.save_upload(
                image_file,
                expected_kind="image",
                subdir="course-images",
            )
        except ValueError as exc:
            return flask.jsonify({"message": str(exc)}), 400
        course.thumbnail = stored_path

    server.extensions.database.session.commit()

    return (
        flask.jsonify(
            {
                "message": "Course has been updated",
                "image_url": server.media.build_media_url(course.thumbnail),
            }
        ),
        200,
    )


@blueprint.route("/courses/<int:course_id>", methods=["DELETE"])
@flask_jwt_extended.jwt_required()
def delete_course(course_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can delete the courses"}), 403

    course = Course.query.get(course_id)
    if not course:
        return flask.jsonify({"message": "Course not found"}), 404

    server.extensions.database.session.delete(course)
    server.extensions.database.session.commit()
    return flask.jsonify({"message": "Course has been deleted"}), 200
