def test_register_user_success(client):
    response = client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "full_name": "New User",
        "phone_number": "9998887776",
        "password": "Password123",
        "confirm_password": "Password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["role"] == "customer"

def test_register_password_mismatch(client):
    response = client.post("/api/auth/register", json={
        "email": "mismatch@example.com",
        "full_name": "Mismatch User",
        "password": "Password123",
        "confirm_password": "DifferentPassword"
    })
    assert response.status_code == 400
    assert "Passwords do not match" in response.json()["detail"]

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "WrongPassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_current_user_profile(client, test_customer_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {test_customer_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_customer@example.com"
    assert data["role"] == "customer"

