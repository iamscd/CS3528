"""
Routes for lesson quiz questions
"""

import flask
import flask_jwt_extended

# database
import server.extensions

# models
from server.models import LessonQuiz


# create blueprint first
blueprint = flask.Blueprint("quiz", __name__)


# --------------------------------------------------
# GET quiz questions for a lesson
# --------------------------------------------------

@blueprint.route("/lessons/<int:lesson_id>/quizzes", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_quiz_questions(lesson_id):

    questions = LessonQuiz.query.filter_by(lesson_id=lesson_id).all()

    if not questions:
        return flask.jsonify({"message": "No quiz questions found for this lesson"}), 404

    result = []

    for q in questions:
        result.append({
            "id": q.id,
            "question": q.question,
            "options": q.options,
            "correct_option": q.correct_option,
            "correct_numeric_answer": q.correct_numeric_answer
        })

    return flask.jsonify(result), 200


# --------------------------------------------------
# CREATE quiz question (admin only)
# --------------------------------------------------

@blueprint.route("/quizzes", methods=["POST"])
@flask_jwt_extended.jwt_required()
def create_quiz_question():

    claims = flask_jwt_extended.get_jwt()

    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can create quiz questions"}), 403

    data = flask.request.get_json()

    lesson_id = data.get("lesson_id")
    question_text = data.get("question")

    options = data.get("options")
    correct_option = data.get("correct_option")
    correct_numeric_answer = data.get("correct_numeric_answer")

    if not lesson_id or not question_text:
        return flask.jsonify({"message": "lesson_id and question are required"}), 400

    # -------------------------------
    # MULTIPLE CHOICE QUESTION
    # -------------------------------

    if options:

        if len(options) < 2:
            return flask.jsonify({"message": "At least two options are required"}), 400

        if correct_option not in options:
            return flask.jsonify({"message": "Correct option must be one of the options"}), 400

        question = LessonQuiz(
            lesson_id=lesson_id,
            question=question_text,
            options=options,
            correct_option=correct_option,
            correct_numeric_answer=None
        )

    # -------------------------------
    # NUMERIC QUESTION
    # -------------------------------

    elif correct_numeric_answer is not None:

        question = LessonQuiz(
            lesson_id=lesson_id,
            question=question_text,
            options=None,
            correct_option=None,
            correct_numeric_answer=correct_numeric_answer
        )

    else:
        return flask.jsonify({
            "message": "Provide either options/correct_option OR correct_numeric_answer"
        }), 400


    server.extensions.database.session.add(question)
    server.extensions.database.session.commit()

    return flask.jsonify({
        "message": "Quiz question created",
        "question_id": question.id
    }), 201
