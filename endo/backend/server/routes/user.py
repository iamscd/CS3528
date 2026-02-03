"""
TODO: Write docstring here
"""
# -- Import flask -- 
import flask
import flask_jwt_extended
import flask_bcrypt

# -- Import required server modules --
import server.extensions

# -- Import server models --
from server.models import User, Lesson, LessonProgress, Certificate

blueprint = flask.Blueprint('user', __name__)
bcrypt = flask_bcrypt.Bcrypt()

# --------------------------------------------------
# GET /api/user/profile - Retrieve user profile info
# --------------------------------------------------
@blueprint.route('/api/user/profile', methods=['GET'])
@flask_jwt_extended.jwt_required()
def get_user_profile():
    user_id = flask_jwt_extended.get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return flask.jsonify({'error': 'User not found'}), 404

    # --- Compute learning progress ---
    total_lessons = Lesson.query.count()
    completed_lessons = LessonProgress.query.filter_by(user_id=user_id, is_completed=True).count()
    progress_percent = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

    # --- Certificates ---
    certificate = Certificate.query.filter_by(user_id=user_id).first()
    certificate_status = 'earned' if certificate else 'not earned'

    data = {
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'date_joined': user.created_at.strftime('%Y-%m-%d'),
        'learning_progress': {
            'completed_lessons': completed_lessons,
            'total_lessons': total_lessons,
            'progress_percent': round(progress_percent, 2)
        },
        'certificate_status': certificate_status
    }
    return flask.jsonify(data), 200


# --------------------------------------------------
# PUT /api/user/profile - Update name or password
# --------------------------------------------------
@blueprint.route('/api/user/profile', methods=['PUT'])
@flask_jwt_extended.jwt_required()
def update_user_profile():
    user_id = flask_jwt_extended.get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return flask.jsonify({'error': 'User not found'}), 404

    data = flask.request.get_json() or {}
    name = data.get('name')
    password = data.get('password')

    if name:
        user.name = name
    if password:
        user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    server.extensions.database.session.commit()
    return flask.jsonify({'message': 'Profile updated successfully'}), 200
