import urllib.request
import json
import time

base = 'http://127.0.0.1:8000'
vite_base = 'http://127.0.0.1:3000'

def req(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        data_bytes = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    else:
        data_bytes = None
    
    r = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, json.loads(body) if body else {}

print("=== 1. BACKEND HEALTH CHECK ===")
status, data = req(f"{base}/api/health")
print("Health:", status, data)
assert status == 200

print("\n=== 2. CATEGORIES ===")
status, cats = req(f"{base}/api/categories")
print(f"Total categories: {len(cats)}")
for c in cats:
    print(f"  • {c['name']} (slug: {c['slug']})")
assert len(cats) >= 6

print("\n=== 3. ALL PRODUCTS ===")
status, data = req(f"{base}/api/products?page=1&limit=50")
print(f"Total products in DB: {data.get('total')}")
print(f"Returned items count: {len(data.get('items', []))}")
assert data.get('total') == 42

print("\n=== 4. CATEGORY FILTER TEST ===")
for slug in ['electronics', 'fashion', 'home-living', 'beauty', 'sports', 'books']:
    status, d = req(f"{base}/api/products?category={slug}&limit=50")
    count = d.get('total')
    print(f"Category '{slug}': {count} products")
    assert count == 7, f"Expected 7 products for {slug}, got {count}"

print("\n=== 5. VITE PROXY TEST (port 3000 -> 8000) ===")
status, vp_data = req(f"{vite_base}/api/products?limit=5")
print(f"Vite Proxy Status: {status}")
print(f"Vite Proxy Total Products: {vp_data.get('total')}")
assert status == 200
assert vp_data.get('total') == 42

print("\n=== 6. AUTHENTICATION TEST ===")
test_email = f"testuser_{int(time.time())}@shopsphere.com"
register_payload = {
    "full_name": "Live Test User",
    "email": test_email,
    "phone_number": "9876543210",
    "password": "Password@123",
    "confirm_password": "Password@123"
}
reg_status, reg_data = req(f"{base}/api/auth/register", method='POST', data=register_payload)
print(f"Register status: {reg_status}")
print("Register response:", reg_data)
assert reg_status == 201

login_payload = {
    "email": test_email,
    "password": "Password@123"
}
login_status, token_data = req(f"{base}/api/auth/login", method='POST', data=login_payload)
print(f"Login status: {login_status}")
token = token_data.get("access_token")
print(f"Got JWT Token: {token[:20]}... User role: {token_data.get('user', {}).get('role')}")
assert login_status == 200
assert token is not None

print("\n=== 7. AUTH ME CHECK ===")
auth_header = {"Authorization": f"Bearer {token}"}
me_status, me_data = req(f"{base}/api/auth/me", headers=auth_header)
print(f"Me status: {me_status}, User: {me_data.get('full_name')}")
assert me_status == 200

print("\n=== 8. CART & ORDER WORKFLOW CHECK ===")
# Add first product to cart
first_prod = data['items'][0]
cart_status, cart_data = req(f"{base}/api/cart/items", method='POST', data={"product_id": first_prod['id'], "quantity": 2}, headers=auth_header)
print("Add to cart:", cart_status, cart_data)
assert cart_status == 200

# Get cart
cart_get_status, cart_get = req(f"{base}/api/cart", headers=auth_header)
print("Cart total items:", len(cart_get.get("items", [])))
assert len(cart_get.get("items", [])) == 1

# Add address
addr_payload = {
    "full_name": "Live Test User",
    "phone_number": "9876543210",
    "address_line1": "123 Market St",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postal_code": "560001",
    "country": "India",
    "is_default": True
}
addr_status, addr_resp = req(f"{base}/api/addresses", method='POST', data=addr_payload, headers=auth_header)
addr_id = addr_resp.get("id")
print("Added address status:", addr_status, "ID:", addr_id)
assert addr_status == 201
assert addr_id is not None

# Create order
order_payload = {
    "address_id": addr_id,
    "payment_method": "card"
}
order_status, order_data = req(f"{base}/api/orders", method='POST', data=order_payload, headers=auth_header)
print("Order creation status:", order_status)
order_id = order_data.get("id")
print(f"Created Order #{order_id}, Total: Rs.{order_data.get('total_amount')}, Status: {order_data.get('status')}")
assert order_status == 201

print("\n=== 9. ADMIN DASHBOARD STATS CHECK ===")
# Login as admin
_, admin_login = req(f"{base}/api/auth/login", method='POST', data={"email": "admin@shopsphere.com", "password": "Admin@123456"})
admin_token = admin_login.get("access_token")
admin_header = {"Authorization": f"Bearer {admin_token}"}
stats_status, admin_stats = req(f"{base}/api/admin/dashboard", headers=admin_header)
print("Admin stats:", stats_status, "KPIs:", admin_stats.get('kpis'))
assert stats_status == 200

print("\n==========================================")
print("✨ ALL 9 LIVE VERIFICATION CHECKS PASSED! ✨")
print("==========================================")
