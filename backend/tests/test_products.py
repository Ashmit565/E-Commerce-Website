from decimal import Decimal
from app.models.category import Category
from app.models.product import Product

def test_list_products_and_search(client, db):
    cat = Category(name="TestCat", slug="testcat")
    db.add(cat)
    db.commit()

    p = Product(
        name="Ultra Smart Watch",
        slug="ultra-smart-watch",
        category_id=cat.id,
        description="A great watch",
        price=Decimal("4999.00"),
        original_price=Decimal("6999.00"),
        stock=10,
        thumbnail="https://example.com/watch.jpg"
    )
    db.add(p)
    db.commit()

    # Get products
    res = client.get("/api/products")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(item["name"] == "Ultra Smart Watch" for item in data["items"])

    # Search
    search_res = client.get("/api/products?search=Watch")
    assert search_res.status_code == 200
    assert len(search_res.json()["items"]) >= 1

def test_admin_create_product(client, test_admin_token):
    res = client.post(
        "/api/products",
        headers={"Authorization": f"Bearer {test_admin_token}"},
        json={
            "name": "Wireless Gaming Headset",
            "description": "High fidelity audio",
            "price": "3499.00",
            "original_price": "4999.00",
            "stock": 20,
            "thumbnail": "https://example.com/headset.jpg"
        }
    )
    assert res.status_code == 201
    assert res.json()["name"] == "Wireless Gaming Headset"

def test_customer_cannot_create_product(client, test_customer_token):
    res = client.post(
        "/api/products",
        headers={"Authorization": f"Bearer {test_customer_token}"},
        json={
            "name": "Hacked Product",
            "description": "Exploit",
            "price": "100.00",
            "original_price": "100.00",
            "stock": 10,
            "thumbnail": "https://example.com/hacked.jpg"
        }
    )
    assert res.status_code == 403

