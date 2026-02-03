"""
TODO: Write docstring here
"""
import os

# -- import server modules --
import server
import server.logging
from server.models import User, Course, Module, Lesson, LessonQuiz
from server.extensions import database

logging = server.logging.get_logger(__name__)


if os.getenv("RESET_DB") == "true":
    database.drop_all()
    database.create_all()

def _seed_initial_data() -> None:
    """Create default users, course, module and lesson if none exist."""

    # If any users exist, assume database is already seeded
    if User.query.first():
        logging.info("Seed data skipped: existing users found.")
        return

    logging.info("No users found. Seeding initial dataset...")

    bcrypt = server.extensions.bcrypt

    # --- Load passwords from environment ---
    admin_pass = os.getenv("ADMIN_PASSWORD")
    member_pass = os.getenv("MEMBER_PASSWORD")

    # ---- USERS ----
    admin = User(
        name="Admin",
        email=os.getenv("ADMIN_EMAIL"),
        password_hash=bcrypt.generate_password_hash(admin_pass).decode("utf-8"),
        role="admin",
    )

    member = User(
        name="Member",
        email=os.getenv("MEMBER_EMAIL"),
        password_hash=bcrypt.generate_password_hash(member_pass).decode("utf-8"),
        role="member",
    )

    database.session.add(admin)
    database.session.add(member)
    database.session.commit()

    logging.info("Users created: %s, %s", admin.email, member.email)

    # ---- COURSE ----
    course = Course(
        title="Demo Course",
        description="A demo course for testing."
    )
    database.session.add(course)
    database.session.commit()

    # ---- MODULE ----
    module = Module(
        title="Demo Module",
        description="Demo module for testing.",
        course_id=course.id
    )
    database.session.add(module)
    database.session.commit()

    # ---- LESSON ----
    lesson = Lesson(
        title="Demo Lesson",
        module_id=module.id,
        content_type="text",
        text_content="Demo content"
    )
    database.session.add(lesson)
    database.session.commit()

    logging.info("Demo course/module/lesson created successfully.")

    # ---- QUIZ FOR DEMO LESSON ----
    demo_quiz = LessonQuiz(
        lesson_id=lesson.id,
        question="Which part of the platform does this demo lesson belong to?",
        options=[
            "The demo course and demo module",
            "A random unrelated course",
            "It is not linked to any module",
            "It is only for admin testing"
        ],
        correct_option="The demo course and demo module",
    )

    database.session.add(demo_quiz)
    database.session.commit()

    logging.info(
        "Demo quiz created for lesson id %s (quiz id: %s)",
        lesson.id,
        demo_quiz.id,
    )



def main() -> None:
    """Create all database tables and seed initial demo data."""
    app = server.create_app()
    with app.app_context():
        if os.getenv("RESET_DB") == "true":
            logging.warning("RESET_DB=true – dropping all tables...")
            database.drop_all()

        database.create_all()
        logging.info("Database tables created successfully.")
        _seed_initial_data()



if __name__ == "__main__":
    main()