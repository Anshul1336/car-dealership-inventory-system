import uuid


def test_register_user(client):
    payload = {
        "username": "Anshul",
        "mobile": "9876543210",
        "email": f"{uuid.uuid4()}@test.com",
        "password": "Password@123"
    }

    response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == payload["email"]
    assert data["username"] == payload["username"]


def test_duplicate_email_registration(client):

    email = f"{uuid.uuid4()}@test.com"

    payload = {
        "username": "User1",
        "mobile": "9876543210",
        "email": email,
        "password": "Password@123"
    }

    client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login_success(client):

    email = f"{uuid.uuid4()}@test.com"

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "User",
            "mobile": "9876543210",
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

    assert response.status_code == 200

    token = response.json()

    assert "access_token" in token
    assert token["token_type"] == "bearer"


def test_login_wrong_password(client):

    email = f"{uuid.uuid4()}@test.com"

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "User",
            "mobile": "9876543210",
            "email": email,
            "password": "Password@123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401


def test_login_non_existing_user(client):

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nouser@test.com",
            "password": "Password@123",
        },
    )

    assert response.status_code == 401