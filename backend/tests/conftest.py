import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.modules.auth.model import User
from app.main import app
from app.core.database import Base, get_db


TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)

    yield

    Base.metadata.drop_all(bind=engine)

    engine.dispose()

    if os.path.exists("test.db"):
        os.remove("test.db")


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override():
        yield db

    app.dependency_overrides[get_db] = override

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()

import uuid


@pytest.fixture
def admin_token(client, db):
    email = f"{uuid.uuid4()}@admin.com"

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "Admin",
            "mobile": "9999999999",
            "email": email,
            "password": "Password@123",
        },
    )

    user = db.query(User).filter(User.email == email).first()

    assert user is not None
    
    user.is_admin = True
    db.commit()

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "Password@123",
        },
    )

    return response.json()["access_token"]


@pytest.fixture
def user_token(client, db):
    email = f"{uuid.uuid4()}@user.com"

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "User",
            "mobile": "8888888888",
            "email": email,
            "password": "Password@123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "Password@123",
        },
    )

    return response.json()["access_token"]