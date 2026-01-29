"""
TODO: Write docstring here
"""

# -- Import flask modules --
import flask_bcrypt
import flask_cors
import flask_jwt_extended
import flask_sqlalchemy

# -- Initialize extensions --
database = flask_sqlalchemy.SQLAlchemy()
jwt = flask_jwt_extended.JWTManager()
cors = flask_cors.CORS()
bcrypt = flask_bcrypt.Bcrypt()
