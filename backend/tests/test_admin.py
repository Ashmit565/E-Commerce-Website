def test_admin_dashboard_stats(client, test_admin_token):
    headers = {"Authorization": f"Bearer {test_admin_token}"}
    res = client.get("/api/admin/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "kpi" in data
    assert "total_sales" in data["kpi"]
    assert "total_orders" in data["kpi"]
    assert "sales_overview" in data
    assert "recent_orders" in data

def test_admin_customer_forbidden(client, test_customer_token):
    headers = {"Authorization": f"Bearer {test_customer_token}"}
    res = client.get("/api/admin/dashboard", headers=headers)
    assert res.status_code == 403

