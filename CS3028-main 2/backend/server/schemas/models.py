"""
Schema definitions for all SQLAlchemy models.
Follows explicit import style across the project.
"""

import marshmallow
import server.extensions
import server.models
from server.schemas.auto import AutoSchema


class UserSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.User


class UserRegisterSchema(AutoSchema):
    password = marshmallow.fields.String(required=True, load_only=True)

    class Meta(AutoSchema.Meta):
        model = server.models.User
        fields = ("name", "email", "password")

    @marshmallow.post_load
    def hash_password(self, data, **_):
        """Convert plaintext password -> password_hash and drop raw password."""
        raw_password = data.pop("password")

        hashed = server.extensions.bcrypt.generate_password_hash(raw_password).decode(
            "utf-8"
        )
        data["password_hash"] = hashed

        return data


class UserLoginSchema(marshmallow.Schema):
    email = marshmallow.fields.Email(required=True)
    password = marshmallow.fields.String(required=True, load_only=True)


class CourseSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.Course


class ModuleSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.Module


class LessonSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.Lesson


class LessonCommentSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.LessonComment


class LessonProgressSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.LessonProgress


class LessonQuizSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.LessonQuiz


class ModuleTestSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.ModuleTest


class UserTestResultSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.UserTestResult


class CertificateSchema(AutoSchema):
    class Meta(AutoSchema.Meta):
        model = server.models.Certificate
