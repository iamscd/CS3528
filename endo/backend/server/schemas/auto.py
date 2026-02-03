import marshmallow
import marshmallow_sqlalchemy
import server.extensions
import sqlalchemy


class AutoSchema(marshmallow_sqlalchemy.SQLAlchemyAutoSchema):
    class Meta:
        sqla_session = server.extensions.database.session
        load_instance = False
        include_fk = True
        unknown = marshmallow.EXCLUDE

    @marshmallow.validates_schema
    def validate_fields(self, data, **kwargs):
        model = self.Meta.model
        mapper = sqlalchemy.inspect(model)
        table = model.__table__
        session = server.extensions.database.session

        errors = {}

        # Respect Meta.exclude for this schema
        excluded_field_names = set(getattr(self.Meta, "exclude", []) or [])

        # Primary key for unique update exclusion
        primary_key_columns = list(mapper.primary_key)
        primary_key_column = (
            primary_key_columns[0] if len(primary_key_columns) > 0 else None
        )
        primary_key_name = (
            primary_key_column.name if primary_key_column is not None else None
        )

        # context is optional – be defensive
        context = getattr(self, "context", {}) or {}
        instance = context.get("instance")
        instance_id = (
            getattr(instance, primary_key_name)
            if instance is not None and primary_key_name is not None
            else None
        )

        schema_field_names = set(self.fields.keys())
        for column in table.columns:
            field_name = column.name

            if field_name not in schema_field_names:
                continue

            # Skip fields that this schema explicitly excluded
            if field_name in excluded_field_names:
                continue

            # Missing required field
            if field_name not in data:
                if (
                    not column.nullable
                    and not column.primary_key
                    and column.default is None
                    and column.server_default is None
                ):
                    errors.setdefault(field_name, []).append("Missing required field.")
                continue

            value = data[field_name]

            # Nullability
            if value is None:
                if not column.nullable:
                    errors.setdefault(field_name, []).append("Field may not be null.")
                continue

            # String + max length
            if hasattr(column.type, "length"):
                if not isinstance(value, str):
                    errors.setdefault(field_name, []).append("Must be a string.")
                elif column.type.length and len(value) > column.type.length:
                    errors.setdefault(field_name, []).append(
                        f"Must not exceed {column.type.length} characters."
                    )

            # Enum constraint
            if isinstance(column.type, sqlalchemy.Enum):
                allowed = column.type.enums
                if value not in allowed:
                    errors.setdefault(field_name, []).append(
                        f"Must be one of: {', '.join(allowed)}"
                    )

            # Foreign key existence
            if column.foreign_keys:
                for foreign_key in column.foreign_keys:
                    target_column = foreign_key.column
                    stmt = (
                        sqlalchemy.select(target_column)
                        .where(target_column == value)
                        .limit(1)
                    )
                    if session.execute(stmt).first() is None:
                        errors.setdefault(field_name, []).append(
                            "Invalid foreign key reference."
                        )

            # Unique constraint
            if column.unique:
                query = session.query(model).filter(getattr(model, field_name) == value)

                # When updating, exclude the current row
                if instance_id is not None and primary_key_name:
                    query = query.filter(
                        getattr(model, primary_key_name) != instance_id
                    )

                if query.first():
                    errors.setdefault(field_name, []).append("Must be unique.")

        if errors:
            raise marshmallow.ValidationError(errors)
