"""
Routes for lesson quiz questions
"""
import flask
import flask_jwt_extended

import server.extensions
from server.models import LessonQuiz

blueprint = flask.Blueprint("quiz", __name__)


@blueprint.route("/lessons/<int:lesson_id>/quizzes", methods=["GET"])
@flask_jwt_extended.jwt_required()
def get_quiz_questions(lesson_id):
    questions = LessonQuiz.query.filter_by(lesson_id=lesson_id).all()

    if not questions:
        return flask.jsonify({"message": "No quiz questions found for this lesson"}), 404

    letter_to_index = {"A": 0, "B": 1, "C": 2, "D": 3}

    result = []
    for q in questions:
        options = q.options or []
        if q.correct_option and options:
            idx = letter_to_index.get(q.correct_option)
            correct_option_text = options[idx] if idx is not None and idx < len(options) else q.correct_option
        else:
            correct_option_text = q.correct_option

        result.append({
            "id": q.id,
            "question": q.question,
            "options": options,
            "correct_option": correct_option_text,
            "correct_numeric_answer": q.correct_numeric_answer
        })

    return flask.jsonify(result), 200


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

    if options is not None:
        if len(options) < 2:
            return flask.jsonify({"message": "At least two options are required"}), 400
        if correct_option not in options:
            return flask.jsonify({"message": "Correct option must be one of the provided options"}), 400

        index_to_letter = {0: "A", 1: "B", 2: "C", 3: "D"}
        correct_letter = index_to_letter.get(options.index(correct_option), "A")

        question = LessonQuiz(
            lesson_id=lesson_id,
            question=question_text,
            options=options,
            correct_option=correct_letter,
            correct_numeric_answer=None
        )

    elif correct_numeric_answer is not None:
        if not isinstance(correct_numeric_answer, list) or len(correct_numeric_answer) != 3:
            return flask.jsonify({"message": "correct_numeric_answer must be [lower, answer, upper]"}), 400

        lower, answer, upper = correct_numeric_answer
        if not (lower <= answer <= upper):
            return flask.jsonify({"message": "answer must sit within the lower and upper bounds"}), 400

        question = LessonQuiz(
            lesson_id=lesson_id,
            question=question_text,
            options=None,
            correct_option=None,
            correct_numeric_answer=correct_numeric_answer
        )

    else:
        return flask.jsonify({"message": "Provide either options/correct_option or correct_numeric_answer"}), 400

    server.extensions.database.session.add(question)
    server.extensions.database.session.commit()

    return flask.jsonify({"message": "Quiz question created", "question_id": question.id}), 201

# DELETE quiz question (admin only)
@blueprint.route("/quizzes/<int:quiz_id>", methods=["DELETE"])
@flask_jwt_extended.jwt_required()
def delete_quiz_question(quiz_id):
    claims = flask_jwt_extended.get_jwt()
    if claims.get("role") != "admin":
        return flask.jsonify({"message": "Only admins can delete quiz questions"}), 403

    from server.models import LessonQuiz
    question = LessonQuiz.query.get(quiz_id)
    if not question:
        return flask.jsonify({"message": "Question not found"}), 404

    server.extensions.database.session.delete(question)
    server.extensions.database.session.commit()
    return flask.jsonify({"message": "Question deleted"}), 200