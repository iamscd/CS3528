from datetime import datetime

import flask_jwt_extended

from server.extensions import bcrypt
from server.extensions import database as db


# -------------------------
# Users
# -------------------------
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("member", "admin", name="user_role"), default="member", nullable = False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    courses_created = db.relationship("Course", backref="creator", lazy=True)
    lesson_comments = db.relationship("LessonComment", backref="user", lazy=True)
    lesson_progress = db.relationship("LessonProgress", backref="user", lazy=True)
    test_results = db.relationship("UserTestResult", backref="user", lazy=True)

    def check_password(self, plaintext_password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, plaintext_password)

    def generate_access_token(self) -> str:
        """
        Create a JWT access token for this user.
        """
        return flask_jwt_extended.create_access_token(
            identity=str(self.id),
            additional_claims={"role": self.role},
        )


# -------------------------
# Courses
# -------------------------
class Course(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    thumbnail = db.Column(db.String(255))
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    modules = db.relationship(
        "Module", backref="course", lazy=True, cascade="all, delete-orphan"
    )


# -------------------------
# Modules
# -------------------------
class Module(db.Model):
    __tablename__ = "modules"
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    order_index = db.Column(db.Integer, default=0)

    lessons = db.relationship(
        "Lesson", backref="module", lazy=True, cascade="all, delete-orphan"
    )
    module_tests = db.relationship(
        "ModuleTest", backref="module", lazy=True, cascade="all, delete-orphan"
    )


# -------------------------
# Lessons
# -------------------------
class Lesson(db.Model):
    __tablename__ = "lessons"
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    content_type = db.Column(db.Enum("text", "image", "video", "mixed", name="lesson_content_type"), nullable=False, )
    content_url = db.Column(db.String(255))
    text_content = db.Column(db.Text)
    order_index = db.Column(db.Integer, default=0)

    comments = db.relationship(
        "LessonComment", backref="lesson", lazy=True, cascade="all, delete-orphan"
    )
    progress = db.relationship(
        "LessonProgress", backref="lesson", lazy=True, cascade="all, delete-orphan"
    )
    quizzes = db.relationship(
        "LessonQuiz", backref="lesson", lazy=True, cascade="all, delete-orphan"
    )


# -------------------------
# Lesson Comments
# -------------------------
class LessonComment(db.Model):
    __tablename__ = "lesson_comments"
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# -------------------------
# Lesson Progress
# -------------------------
class LessonProgress(db.Model):
    __tablename__ = "lesson_progress"
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)


# -------------------------
# Lesson Quizzes
# -------------------------


class LessonQuiz(db.Model):
    __tablename__ = "lesson_quizzes"

    id = db.Column(db.Integer, primary_key=True)

    lesson_id = db.Column(
        db.Integer,
        db.ForeignKey("lessons.id"),
        nullable=False
    )

    question = db.Column(db.Text, nullable=False)

    # multiple choice questions
    options = db.Column(db.JSON, nullable=True)
    correct_option = db.Column(db.Enum("A", "B", "C", "D", name="module_test_correct_option"), nullable=False,)

    # numeric questions
    correct_numeric_answer = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f"<LessonQuiz {self.id}>"


# -------------------------
# Module Tests
# -------------------------
class ModuleTest(db.Model):
    __tablename__ = "module_tests"
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=False)
    question = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255))
    option_b = db.Column(db.String(255))
    option_c = db.Column(db.String(255))
    option_d = db.Column(db.String(255))

    correct_option = db.Column(
    db.Enum("A", "B", "C", "D", name="quiz_correct_option"),
    nullable=False,
)
    

    results = db.relationship(
        "UserTestResult", backref="test", lazy=True, cascade="all, delete-orphan"
    )


# -------------------------
# User Test Results
# -------------------------
class UserTestResult(db.Model):
    __tablename__ = "user_test_results"
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey("module_tests.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    score = db.Column(db.Float, default=0.0)
    attempt_date = db.Column(db.DateTime, default=datetime.utcnow)


# -------------------------
# Certificates
# -------------------------
class Certificate(db.Model):
    __tablename__ = "certificates"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(
        db.String(150), nullable=False, default="Course Completion Certificate"
    )
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    certificate_code = db.Column(db.String(50), unique=True)  # optional unique code
    certificate_file = db.Column(db.String(255))  # optional URL/path to PDF/image

    # Relationships
    user = db.relationship("User", backref="certificates")
    course = db.relationship("Course", backref="certificates")
