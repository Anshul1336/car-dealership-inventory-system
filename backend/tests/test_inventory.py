import uuid


def vehicle_payload(quantity=5):
    return {
        "make": "Toyota",
        "model": f"Fortuner-{uuid.uuid4().hex[:6]}",
        "year": 2024,
        "category": "SUV",
        "fuel_type": "Diesel",
        "transmission": "Automatic",
        "color": "Black",
        "price": 4500000,
        "quantity": quantity,
    }


def test_purchase_vehicle(client, admin_token, user_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(quantity=5),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    vehicle_id = response.json()["id"]

    response = client.post(
        f"/api/v1/vehicles/{vehicle_id}/purchase",
        json={"quantity": 2},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 200
    assert response.json()["quantity"] == 3


def test_purchase_insufficient_stock(client, admin_token, user_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(quantity=2),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    vehicle_id = response.json()["id"]

    response = client.post(
        f"/api/v1/vehicles/{vehicle_id}/purchase",
        json={"quantity": 5},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 400



def test_restock_vehicle(client, admin_token):

    response = client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(quantity=1),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    vehicle_id = response.json()["id"]

    response = client.post(
        f"/api/v1/vehicles/{vehicle_id}/restock",
        json={"quantity": 4},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    assert response.json()["quantity"] == 5


def test_inventory_stats(client, admin_token):

    client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(quantity=5),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    response = client.get(
        "/api/v1/vehicles/stats",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_vehicle_models" in data
    assert "total_stock" in data
    assert "inventory_value" in data
    assert "out_of_stock" in data


def test_low_stock_endpoint(client, admin_token):

    client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(quantity=2),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    client.post(
        "/api/v1/vehicles/",
        json=vehicle_payload(quantity=10),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    response = client.get(
        "/api/v1/vehicles/low-stock?threshold=5",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200

    vehicles = response.json()

    assert len(vehicles) >= 1

    for vehicle in vehicles:
        assert vehicle["quantity"] <= 5