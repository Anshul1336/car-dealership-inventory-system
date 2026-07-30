import uuid


def vehicle_payload():
    return {
        "make": "Toyota",
        "model": f"Fortuner-{uuid.uuid4().hex[:6]}",
        "year": 2024,
        "category": "SUV",
        "fuel_type": "Diesel",
        "transmission": "Automatic",
        "color": "Black",
        "price": 4500000,
        "quantity": 5,
    }


def test_admin_can_create_vehicle(client, admin_token):
    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(),
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["make"] == "Toyota"
    assert data["quantity"] == 5


def test_get_all_vehicles(client):
    response = client.get("/api/v1/vehicles/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_vehicle_by_id(client, admin_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(),
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    vehicle_id = response.json()["id"]

    response = client.get(
        f"/api/v1/vehicles/{vehicle_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == vehicle_id


def test_admin_can_update_vehicle(client, admin_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(),
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    vehicle_id = response.json()["id"]

    updated = vehicle_payload()
    updated["price"] = 5500000

    response = client.put(
        f"/api/v1/vehicles/{vehicle_id}",
        json=updated,
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["price"] == 5500000


def test_admin_can_delete_vehicle(client, admin_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(),
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    vehicle_id = response.json()["id"]

    response = client.delete(
        f"/api/v1/vehicles/{vehicle_id}",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Vehicle deleted successfully"


def test_normal_user_cannot_create_vehicle(client, user_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(),
        headers={
            "Authorization": f"Bearer {user_token}"
        },
    )

    assert response.status_code == 403


def test_normal_user_cannot_delete_vehicle(client, admin_token, user_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(),
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
    )

    vehicle_id = response.json()["id"]

    response = client.delete(
        f"/api/v1/vehicles/{vehicle_id}",
        headers={
            "Authorization": f"Bearer {user_token}"
        },
    )

    assert response.status_code == 403