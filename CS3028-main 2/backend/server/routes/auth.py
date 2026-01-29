"""
TODO: Write docstring here
"""

# -- Import flask --
import flask

# -- Import decorator helpers --
from server.decorators import schema

# -- Import required server modules --
from server.extensions import database

# -- Import server models & schemas --
from server.models import User
from server.schemas.models import UserLoginSchema, UserRegisterSchema

blueprint = flask.Blueprint("auth", __name__, url_prefix="/auth")


@blueprint.route("/register", methods=["POST"])
@schema.payload(UserRegisterSchema)
def register():
    data = flask.g.payload
    user = User(**data, role="member")
    database.session.add(user)
    database.session.commit()

    return flask.jsonify({"message": "User registered successfully"}), 201


@blueprint.route("/login", methods=["POST"])
@schema.payload(UserLoginSchema)
def login():
    data = flask.g.payload

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return flask.jsonify({"message": "Invalid credentials"}), 401

    return flask.jsonify({"access_token": user.generate_access_token()}), 200
