"""
TODO: Write docstring here
"""
# -- Import flask -- 
import flask
import flask_jwt_extended

# -- Import required server modules --
import server.extensions

# -- Import server models --
from server.models import Course

blueprint = flask.Blueprint('course', __name__)

# GET all courses (member or admin)
@blueprint.route('/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    output = []

    for c in courses:
        output.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "image_url": c.thumbnail,
            "created_at": c.created_at.isoformat(),
        })
    return flask.jsonify(output), 200

# POST create course (admin only)
@blueprint.route('/courses', methods=['POST'])
@flask_jwt_extended.jwt_required()
def create_course():
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Admin access is  required"}), 403
    data = flask.request.get_json() or {}

    title = data.get("title")
    if not title or not isinstance(title, str):
        return flask.jsonify({"message": "A valid title is required"}), 400

    course = Course(
        title=title.strip(),
        description=data.get("description", ""),
        thumbnail=data.get("image_url"),
        created_by=flask_jwt_extended.get_jwt_identity()
    )

    server.extensions.database.session.add(course)
    server.extensions.database.session.commit()
    return flask.jsonify({"message": "Course created", "course_id": course.id}), 200

# GET single course
@blueprint.route('/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return flask.jsonify({'message': 'Course not found'}), 404

    return flask.jsonify({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'image_url': course.thumbnail,
        'created_at': course.created_at.isoformat(),
        'created_by': course.created_by
    }), 200


# PUT update course (admin only)
@blueprint.route('/courses/<int:course_id>', methods=['PUT'])
@flask_jwt_extended.jwt_required()
def update_course(course_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get('role') != 'admin':
        return flask.jsonify({'message': 'Only admins can update the courses'}), 403

    course = Course.query.get(course_id)
    if not course:
        return flask.jsonify({'message': 'Course is not found'}), 404

    data = flask.request.get_json(silent=True) or {}

    title = data.get('title')
    description = data.get('description')
    image_url = data.get('image_url')

    if title is not None:
        if not isinstance(title, str) or not title.strip():
            return flask.jsonify({'message': 'Field \"title\" must be a non-empty string'}), 400
        course.title = title.strip()

    if description is not None:
        course.description = description

    if image_url is not None:
        course.thumbnail = image_url

    server.extensions.database.session.commit()

    return flask.jsonify({'message': 'Course has been updated'}), 200


# DELETE course (admin only)
@blueprint.route('/courses/<int:course_id>', methods=['DELETE'])
@flask_jwt_extended.jwt_required()
def delete_course(course_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get('role') != 'admin':
        return flask.jsonify({'message': 'Only admins can delete the courses'}), 403

    course = Course.query.get(course_id)
    if not course:
        return flask.jsonify({'message': 'Course not found'}), 404

    server.extensions.database.session.delete(course)
    server.extensions.database.session.commit()
    return flask.jsonify({'message': 'Course has been deleted'}), 200
