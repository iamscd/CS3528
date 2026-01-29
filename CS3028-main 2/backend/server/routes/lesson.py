"""
TODO: Write docstring here
"""

# -- Import flask --
import flask
import flask_jwt_extended

# -- Import required server modules --
import server.extensions

# -- Import server models --
from server.models import Lesson, LessonProgress, Module

blueprint = flask.Blueprint("lesson", __name__)


# GET lessons by module
@blueprint.route("/modules/<int:module_id>/lessons", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_lessons(module_id):
    lessons = Lesson.query.filter_by(module_id=module_id).all()
    return flask.jsonify(
        [
            {"id": l.id, "title": l.title, "content_type": l.content_type}
            for l in lessons
        ]
    )


# GET single lesson by ID
@blueprint.route("/lessons/<int:lesson_id>", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_lesson(lesson_id):
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return flask.jsonify({"message": "Lesson not found"}), 404

    return flask.jsonify(
        {
            "id": lesson.id,
            "title": lesson.title,
            "content_type": lesson.content_type,
            "text_content": lesson.text_content,
        }
    )


# POST create lesson (admin only)
@blueprint.route("/lessons", methods=["POST"])
@flask_jwt_extended.jwt_required()
def create_lesson():
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can create lessons"}), 403

    data = flask.request.get_json()
    module_id = data.get("module_id")
    if not module_id or not Module.query.get(module_id):
        return flask.jsonify({"error": "Invalid or missing module_id"}), 400

    lesson = Lesson(
        title=data.get("title"),
        module_id=module_id,
        content_type=data.get("content_type", "text"),
        text_content=data.get("text_content", ""),
    )
    server.extensions.database.session.add(lesson)
    server.extensions.database.session.commit()

    return flask.jsonify({"message": "Lesson created", "lesson_id": lesson.id}), 200


# POST mark lesson complete (member only)
@blueprint.route("/lessons/<int:lesson_id>/progress", methods=["POST"])
@flask_jwt_extended.jwt_required()
def mark_lesson_complete(lesson_id):
    user_id = flask_jwt_extended.get_jwt_identity()  # current user
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return flask.jsonify({"error": "Lesson not found"}), 404

    progress = LessonProgress.query.filter_by(
        user_id=user_id, lesson_id=lesson_id
    ).first()
    if not progress:
        progress = LessonProgress(
            user_id=user_id, lesson_id=lesson_id, is_completed=True
        )
        server.extensions.database.session.add(progress)
    else:
        progress.is_completed = True

    server.extensions.database.session.commit()
    return flask.jsonify({"is_completed": True}), 200
