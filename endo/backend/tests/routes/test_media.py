"""
Route tests for uploaded media support.
"""

import io
import pathlib
import shutil
import uuid


def _workspace_upload_dir() -> pathlib.Path:
    path = pathlib.Path(__file__).resolve().parents[2] / "test_uploads" / uuid.uuid4().hex
    path.mkdir(parents=True, exist_ok=True)
    return path


def test_media_upload_requires_admin(
    client,
    test_app,
    transactional_session,
    create_user,
    login_for_token,
):
    upload_dir = _workspace_upload_dir()
    test_app.config["UPLOAD_FOLDER"] = str(upload_dir)
    member = create_user(role="member")
    token = login_for_token(member.email, "password")

    try:
        response = client.post(
            "/media/upload",
            headers={"Authorization": f"Bearer {token}"},
            data={"file": (io.BytesIO(b"image-bytes"), "cover.png")},
            content_type="multipart/form-data",
        )

        assert response.status_code == 403
    finally:
        shutil.rmtree(upload_dir, ignore_errors=True)


def test_media_upload_stores_image_and_returns_public_url(
    client,
    test_app,
    transactional_session,
    admin_user,
    login_for_token,
):
    upload_dir = _workspace_upload_dir()
    test_app.config["UPLOAD_FOLDER"] = str(upload_dir)
    token = login_for_token(admin_user.email, "password")

    try:
        response = client.post(
            "/media/upload",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "kind": "image",
                "file": (io.BytesIO(b"image-bytes"), "cover.png"),
            },
            content_type="multipart/form-data",
        )

        assert response.status_code == 201
        payload = response.get_json()
        assert payload["media_kind"] == "image"
        assert payload["stored_path"].startswith("image/")
        assert payload["content_url"].endswith(payload["stored_path"])
    finally:
        shutil.rmtree(upload_dir, ignore_errors=True)


def test_create_and_read_video_lesson_with_uploaded_file(
    client,
    test_app,
    transactional_session,
    admin_user,
    create_module,
    login_for_token,
):
    upload_dir = _workspace_upload_dir()
    test_app.config["UPLOAD_FOLDER"] = str(upload_dir)
    token = login_for_token(admin_user.email, "password")
    module = create_module()

    try:
        create_response = client.post(
            "/lessons",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "title": "Video Lesson",
                "module_id": str(module.id),
                "content_type": "video",
                "media": (io.BytesIO(b"video-bytes"), "clip.mp4"),
            },
            content_type="multipart/form-data",
        )

        assert create_response.status_code == 200
        lesson_id = create_response.get_json()["lesson_id"]

        read_response = client.get(
            f"/lessons/{lesson_id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert read_response.status_code == 200
        payload = read_response.get_json()
        assert payload["content_type"] == "video"
        assert payload["media_kind"] == "video"
        assert payload["content_url"].endswith(".mp4")
    finally:
        shutil.rmtree(upload_dir, ignore_errors=True)
