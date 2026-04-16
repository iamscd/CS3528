"""
TODO: Write docstring here
"""
# -- Import flask --
import flask

# -- Import required server modules --
import server.extensions
import server.models
import server.config

# -- Import server routes --
import server.routes.user
import server.routes.root
import server.routes.auth
import server.routes.course
import server.routes.module
import server.routes.lesson
import server.routes.quiz
import server.routes.certificates
import server.routes.media


def create_app(config: type[server.config.Config] | None = None) -> flask.Flask:
    """TODO: Write docstring here
    """
    app = flask.Flask(__name__)

    app.config.from_object(config or server.config.current)

    # Initialize extensions
    server.extensions.database.init_app(app)
    server.extensions.jwt.init_app(app)
    server.extensions.cors.init_app(app)

    # Register blueprints from modules
    app.register_blueprint(server.routes.root.blueprint)
    app.register_blueprint(server.routes.user.blueprint)
    app.register_blueprint(server.routes.auth.blueprint)
    app.register_blueprint(server.routes.course.blueprint)
    app.register_blueprint(server.routes.module.blueprint)
    app.register_blueprint(server.routes.lesson.blueprint)
    app.register_blueprint(server.routes.quiz.blueprint)
    app.register_blueprint(server.routes.certificates.blueprint)
    app.register_blueprint(server.routes.media.blueprint)

    return app

