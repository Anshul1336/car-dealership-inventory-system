from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm


from app.core.database import get_db
from app.core.security import create_access_token
from app.modules.auth.schema import (
    UserRegister,
    UserLogin,
    UserResponse,
    Token,
)
from app.modules.auth.service import (
    create_user,
    get_user_by_email,
    authenticate_user,
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return create_user(db, user)


@router.post(
    "/login",
    response_model=Token,
)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = authenticate_user(
        db,
        form_data.username,  # email goes here
        form_data.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        subject=db_user.id,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }