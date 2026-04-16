"""
Lesson routes.
"""

import flask
import flask_jwt_extended

import server.extensions
import server.media
from server.models import Lesson, LessonProgress, Module

blueprint = flask.Blueprint("lesson", __name__)

VALID_CONTENT_TYPES = {"text", "image", "video", "mixed"}


def _request_data() -> dict:
    """Support JSON and multipart form payloads."""
    if flask.request.is_json:
        return flask.request.get_json(silent=True) or {}
    return flask.request.form.to_dict()


def _coerce_int(value, field_name: str) -> int | None:
    """Safely parse an integer field from a request payload."""
    if value in {None, ""}:
        return None

    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be an integer") from exc


def _resolve_media_kind(lesson: Lesson) -> str | None:
    """Infer the rendered media type for a lesson."""
    if lesson.content_type in {"image", "video"}:
        return lesson.content_type
    return server.media.detect_media_kind(filename=lesson.content_url)


def _serialise_lesson(lesson: Lesson) -> dict:
    """Build a consistent lesson payload."""
    return {
        "id": lesson.id,
        "title": lesson.title,
        "content_type": lesson.content_type,
        "text_content": lesson.text_content,
        "content_url": server.media.build_media_url(lesson.content_url),
        "media_kind": _resolve_media_kind(lesson),
        "module_id": lesson.module_id,
        "order_index": lesson.order_index,
    }


def _validate_and_extract_content(data: dict) -> tuple[str, str, str | None, int]:
    """Normalise lesson request data and store an uploaded media file if present."""
    content_type = (data.get("content_type") or "text").strip().lower()
    if content_type not in VALID_CONTENT_TYPES:
        raise ValueError("content_type must be text, image, video, or mixed")

    title = data.get("title")
    if not title or not isinstance(title, str) or not title.strip():
        raise ValueError("A valid title is required")

    text_content = data.get("text_content", "") or ""
    content_url = data.get("content_url")
    media_file = flask.request.files.get("media")

    expected_kind = {"image": "image", "video": "video"}.get(content_type)
    if media_file and media_file.filename:
        subdir = {
            "image": "lesson-images",
            "video": "lesson-videos",
        }.get(expected_kind, "lesson-media")
        content_url, _ = server.media.save_upload(
            media_file,
            expected_kind=expected_kind,
            subdir=subdir,
        )

    if content_type == "text":
        content_url = None

    if content_type in {"image", "video"} and not content_url:
        raise ValueError(f"{content_type} lessons require a media file or content_url")

    if content_type == "mixed" and not text_content and not content_url:
        raise ValueError("mixed lessons require text_content, media, or both")

    order_index = _coerce_int(data.get("order_index"), "order_index") or 0
    return title.strip(), text_content, content_url, order_index


@blueprint.route("/modules/<int:module_id>/lessons", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_lessons(module_id):
    lessons = Lesson.query.filter_by(module_id=module_id).order_by(Lesson.order_index).all()
    return flask.jsonify([_serialise_lesson(lesson) for lesson in lessons]), 200


@blueprint.route("/lessons/<int:lesson_id>", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_lesson(lesson_id):
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return flask.jsonify({"message": "Lesson not found"}), 404

    return flask.jsonify(_serialise_lesson(lesson)), 200


@blueprint.route("/lessons", methods=["POST"])
@flask_jwt_extended.jwt_required()
def create_lesson():
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can create lessons"}), 403

    data = _request_data()

    try:
        module_id = _coerce_int(data.get("module_id"), "module_id")
    except ValueError as exc:
        return flask.jsonify({"error": str(exc)}), 400

    if not module_id or not Module.query.get(module_id):
        return flask.jsonify({"error": "Invalid or missing module_id"}), 400

    try:
        title, text_content, content_url, order_index = _validate_and_extract_content(data)
    except ValueError as exc:
        return flask.jsonify({"error": str(exc)}), 400

    lesson = Lesson(
        title=title,
        module_id=module_id,
        content_type=(data.get("content_type") or "text").strip().lower(),
        text_content=text_content,
        content_url=content_url,
        order_index=order_index,
    )
    server.extensions.database.session.add(lesson)
    server.extensions.database.session.commit()

    return flask.jsonify({"message": "Lesson created", "lesson_id": lesson.id}), 200


@blueprint.route("/lessons/<int:lesson_id>", methods=["PUT"])
@flask_jwt_extended.jwt_required()
def update_lesson(lesson_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can update lessons"}), 403

    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return flask.jsonify({"message": "Lesson not found"}), 404

    data = _request_data()
    if "module_id" in data:
        try:
            module_id = _coerce_int(data.get("module_id"), "module_id")
        except ValueError as exc:
            return flask.jsonify({"error": str(exc)}), 400

        if not module_id or not Module.query.get(module_id):
            return flask.jsonify({"error": "Invalid or missing module_id"}), 400
        lesson.module_id = module_id

    content_type = data.get("content_type", lesson.content_type)
    text_content = data.get("text_content", lesson.text_content)
    content_url = data.get("content_url", lesson.content_url)
    order_index = data.get("order_index", lesson.order_index)
    title = data.get("title", lesson.title)

    merged_data = {
        "title": title,
        "content_type": content_type,
        "text_content": text_content,
        "content_url": content_url,
        "order_index": order_index,
    }

    try:
        title, text_content, content_url, parsed_order_index = _validate_and_extract_content(
            merged_data
        )
    except ValueError as exc:
        return flask.jsonify({"error": str(exc)}), 400

    lesson.title = title
    lesson.content_type = content_type.strip().lower()
    lesson.text_content = text_content
    lesson.content_url = content_url
    lesson.order_index = parsed_order_index

    server.extensions.database.session.commit()
    return flask.jsonify({"message": "Lesson updated"}), 200


@blueprint.route("/lessons/<int:lesson_id>/progress", methods=["GET", "POST"])
@flask_jwt_extended.jwt_required()
def lesson_progress(lesson_id):
    user_id = flask_jwt_extended.get_jwt_identity()
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return flask.jsonify({"error": "Lesson not found"}), 404

    if flask.request.method == "POST":
        progress = LessonProgress.query.filter_by(
            user_id=user_id,
            lesson_id=lesson_id,
        ).first()
        if not progress:
            progress = LessonProgress(
                user_id=user_id,
                lesson_id=lesson_id,
                is_completed=True,
            )
            server.extensions.database.session.add(progress)
        else:
            progress.is_completed = True

        server.extensions.database.session.commit()
        return flask.jsonify({"is_completed": True}), 200

    progress = LessonProgress.query.filter_by(
        user_id=user_id,
        lesson_id=lesson_id,
    ).first()
    return flask.jsonify({"is_completed": bool(progress)}), 200
