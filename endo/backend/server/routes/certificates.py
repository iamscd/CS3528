"""
TODO: Write docstring here
"""

# -- Import flask --
import flask
import flask_jwt_extended

# -- Import required server modules --
import server.extensions

# -- Import server models --
from server.models import Certificate

blueprint = flask.Blueprint("certifcates", __name__)


# GET certificate for a user
@blueprint.route("/certificates/<int:user_id>", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_certificate(user_id):
    cert = Certificate.query.filter_by(user_id=user_id).first()
    if not cert:
        return flask.jsonify({"message": "Certificate not found"}), 404

    return flask.jsonify(
        {
            "certificate_id": cert.id,
            "user_id": cert.user_id,
            "course_id": cert.course_id,
            "issued_at": cert.issued_at,
        }
    )


# POST issue certificate (admin only)
@blueprint.route("/certificates", methods=["POST"])
@flask_jwt_extended.jwt_required()
def issue_certificate():
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can issue certificates"}), 403

    data = flask.request.get_json()
    user_id = data.get("user_id")
    course_id = data.get("course_id")

    if not user_id or not course_id:
        return flask.jsonify({"message": "Missing user_id or course_id"}), 400

    existing_cert = Certificate.query.filter_by(
        user_id=user_id, course_id=course_id
    ).first()
    if existing_cert:
        return flask.jsonify({"message": "Certificate already issued"}), 400

    cert = Certificate(user_id=user_id, course_id=course_id)
    server.extensions.database.session.add(cert)
    server.extensions.database.session.commit()

    return flask.jsonify(
        {"message": "Certificate issued", "certificate_id": cert.id}
    ), 200
