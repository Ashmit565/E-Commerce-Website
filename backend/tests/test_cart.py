from decimal import Decimal
from app.models.product import Product

def test_cart_operations(client, test_customer_token, db):
    prod = Product(
        name="Ergonomic Mouse",
        slug="ergonomic-mouse-test",
        description="Testing mouse",
        price=Decimal("1500.00"),
        original_price=Decimal("2000.00"),
        stock=5,
        thumbnail="https://example.com/mouse.jpg"
    )
    db.add(prod)
    db.commit()

    headers = {"Authorization": f"Bearer {test_customer_token}"}

    # 1. Add to cart
    res = client.post("/api/cart/items", headers=headers, json={
        "product_id": prod.id,
        "quantity": 2
    })
    assert res.status_code == 200
    cart_data = res.json()
    assert cart_data["item_count"] == 2
    assert float(cart_data["subtotal"]) == 3000.00

    # 2. Exceeding stock check
    res_exceed = client.post("/api/cart/items", headers=headers, json={
        "product_id": prod.id,
        "quantity": 10
    })
    assert res_exceed.status_code == 400

    # 3. Update quantity
    item_id = cart_data["items"][0]["id"]
    res_update = client.put(f"/api/cart/items/{item_id}", headers=headers, json={
        "quantity": 3
    })
    assert res_update.status_code == 200
    assert res_update.json()["item_count"] == 3

    # 4. Remove item
    res_remove = client.delete(f"/api/cart/items/{item_id}", headers=headers)
    assert res_remove.status_code == 200
    assert res_remove.json()["item_count"] == 0

