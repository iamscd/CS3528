"""
TODO: Write docstring here
"""
# -- Import flask -- 
import flask
import flask_jwt_extended

# -- Import required server modules --
import server.extensions

# -- Import server models --
from server.models import LessonQuiz

blueprint = flask.Blueprint('quiz', __name__)

# GET quizzes by lesson
@blueprint.route('/lessons/<int:lesson_id>/quizzes', methods=['GET'])
@flask_jwt_extended.jwt_required()
def get_quizzes(lesson_id):
    quizzes = LessonQuiz.query.filter_by(lesson_id=lesson_id).all()
    
    #message if no quizzes are found
    if not quizzes:
        return flask.jsonify({'message': 'No quizzes found for this lesson.'}), 404

    #reutrn quizzes with options as a list
    quizzes_list = []
    for quiz in quizzes:
        quizzes_list.append({
            'id': quiz.id,
            'question': quiz.question,
            'options': quiz.options,  #list of options
            'correct_option': quiz.correct_option  #correct ans
        })
    return flask.jsonify(quizzes_list), 200

#POST create quiz (admin only)
@blueprint.route('/quizzes', methods=['POST'])
@flask_jwt_extended.jwt_required()
def create_quiz():
    claims = flask_jwt_extended.get_jwt()
    if claims.get('role') != 'admin':
        return flask.jsonify({'message': 'Only admins can create quizzes'}), 403

    data = flask.request.get_json()
    options = data.get('options')

    if not options or len(options) < 2:
        return flask.jsonify({'message': 'At least two options are required'}), 400

    correct_option = data.get('correct_option')
    if correct_option not in options:
        return flask.jsonify({'message': 'Correct option must be one of the options'}), 400

    quiz = LessonQuiz(
        lesson_id=data['lesson_id'],
        question=data['question'],
        options=options,
        correct_option=correct_option
    )
    server.extensions.database.session.add(quiz)
    server.extensions.database.session.commit()
    return flask.jsonify({'message': 'Quiz created', 'quiz_id': quiz.id})