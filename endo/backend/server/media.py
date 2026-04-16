"""
Helpers for validating, storing, and serialising uploaded media.
"""

from __future__ import annotations

import pathlib
import uuid

import flask
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}


def ensure_upload_folder() -> pathlib.Path:
    """Create the upload folder on demand and return it."""
    upload_folder = pathlib.Path(flask.current_app.config["UPLOAD_FOLDER"])
    upload_folder.mkdir(parents=True, exist_ok=True)
    return upload_folder


def detect_media_kind(
    filename: str | None = None,
    mimetype: str | None = None,
) -> str | None:
    """Infer whether a file looks like an image or video."""
    suffix = pathlib.Path(filename or "").suffix.lower()
    if suffix in IMAGE_EXTENSIONS:
        return "image"
    if suffix in VIDEO_EXTENSIONS:
        return "video"

    if mimetype:
        if mimetype.startswith("image/"):
            return "image"
        if mimetype.startswith("video/"):
            return "video"

    return None


def save_upload(
    uploaded_file: FileStorage | None,
    *,
    expected_kind: str | None = None,
    subdir: str | None = None,
) -> tuple[str, str]:
    """Validate and save an upload, returning its stored relative path."""
    if uploaded_file is None or not uploaded_file.filename:
        raise ValueError("A file is required")

    filename = secure_filename(uploaded_file.filename)
    if not filename:
        raise ValueError("Filename is required")

    actual_kind = detect_media_kind(filename=filename, mimetype=uploaded_file.mimetype)
    if actual_kind is None:
        raise ValueError("Unsupported file type")

    if expected_kind in {"image", "video"} and actual_kind != expected_kind:
        raise ValueError(f"Expected a {expected_kind} file")

    target_dir_name = subdir or actual_kind
    target_dir = ensure_upload_folder() / target_dir_name
    target_dir.mkdir(parents=True, exist_ok=True)

    suffix = pathlib.Path(filename).suffix.lower()
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    uploaded_file.save(target_dir / stored_name)

    return f"{target_dir_name}/{stored_name}", actual_kind


def build_media_url(stored_path: str | None) -> str | None:
    """Return a public URL for a stored upload or passthrough external URLs."""
    if not stored_path:
        return None

    if stored_path.startswith(("http://", "https://", "data:")):
        return stored_path

    normalised = stored_path.lstrip("/").replace("\\", "/")
    if normalised.startswith("media/"):
        normalised = normalised.split("media/", 1)[1]

    return flask.url_for("media.get_media_file", filename=normalised, _external=True)
