from decimal import Decimal
from app.models.product import Product

def test_order_creation_and_inventory_deduction(client, test_customer_token, db):
    headers = {"Authorization": f"Bearer {test_customer_token}"}

    # Create address
    addr_res = client.post("/api/addresses", headers=headers, json={
        "full_name": "Test Customer",
        "phone_number": "9998887776",
        "address_line1": "123 Tech Street",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560001",
        "is_default": True
    })
    assert addr_res.status_code == 201
    address_id = addr_res.json()["id"]

    # Add product
    prod = Product(
        name="Mechanical Keyboard",
        slug="mechanical-keyboard-test",
        description="RGB switches",
        price=Decimal("2500.00"),
        original_price=Decimal("3500.00"),
        stock=10,
        thumbnail="https://example.com/keyboard.jpg"
    )
    db.add(prod)
    db.commit()

    # Add to cart
    client.post("/api/cart/items", headers=headers, json={
        "product_id": prod.id,
        "quantity": 2
    })

    # Place order
    order_res = client.post("/api/orders", headers=headers, json={
        "address_id": address_id,
        "payment_method": "simulated"
    })
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["status"] == "Confirmed"
    assert order_data["payment_status"] == "completed"
    assert float(order_data["total_amount"]) == 5000.00

    # Verify inventory was deducted from 10 to 8
    db.refresh(prod)
    assert prod.stock == 8

    # Cancel order and verify stock restoration
    cancel_res = client.post(f"/api/orders/{order_data['id']}/cancel", headers=headers, json={
        "reason": "Changed my mind"
    })
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "Cancelled"

    db.refresh(prod)
    assert prod.stock == 10

