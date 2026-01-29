"""
TODO: Write docstring here
"""

# -- Import flask -- 
import flask

# -- Import required server modules --
import server.__version__

blueprint = flask.Blueprint('home', __name__)

@blueprint.route('/')
def home() -> flask.Response:
    """Route return for server home

    :return str: Confirmation message for backend hosting
    """
    return flask.jsonify({
        "message":"Backend is running!", 
        "version": server.__version__.__version__
        })