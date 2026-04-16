"""
Routes for uploading and serving lesson/course media.
"""

import flask
import flask_jwt_extended

import server.media

blueprint = flask.Blueprint("media", __name__, url_prefix="/media")


@blueprint.route("/upload", methods=["POST"])
@flask_jwt_extended.jwt_required()
def upload_media():
    """Upload a single image or video file for later use."""
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can upload media"}), 403

    expected_kind = flask.request.form.get("kind")
    if expected_kind not in {None, "", "image", "video"}:
        return flask.jsonify({"message": "kind must be image or video"}), 400

    uploaded_file = flask.request.files.get("file")

    try:
        stored_path, actual_kind = server.media.save_upload(
            uploaded_file,
            expected_kind=expected_kind or None,
        )
    except ValueError as exc:
        return flask.jsonify({"message": str(exc)}), 400

    return (
        flask.jsonify(
            {
                "stored_path": stored_path,
                "content_url": server.media.build_media_url(stored_path),
                "media_kind": actual_kind,
            }
        ),
        201,
    )


@blueprint.route("/<path:filename>", methods=["GET"])
def get_media_file(filename):
    """Serve uploaded media files."""
    upload_folder = server.media.ensure_upload_folder()
    return flask.send_from_directory(upload_folder, filename, as_attachment=False)
