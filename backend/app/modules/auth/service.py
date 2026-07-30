from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.modules.auth.model import User
from app.modules.auth.schema import UserRegister


def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(
    db: Session,
    user: UserRegister,
):
    hashed = hash_password(user.password)

    db_user = User(
        username=user.username,
        mobile=user.mobile,
        email=user.email,
        hashed_password=hashed,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    return user