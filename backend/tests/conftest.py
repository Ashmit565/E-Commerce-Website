import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.utils.security import hash_password

# Use in-memory SQLite with StaticPool so it is fast and has no file locking issues
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_admin_token(client, db):
    admin = db.query(User).filter(User.email == "test_admin@shopsphere.com").first()
    if not admin:
        admin = User(
            email="test_admin@shopsphere.com",
            hashed_password=hash_password("Admin@123456"),
            full_name="Test Admin",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()

    res = client.post("/api/auth/login", json={
        "email": "test_admin@shopsphere.com",
        "password": "Admin@123456"
    })
    return res.json()["access_token"]

@pytest.fixture
def test_customer_token(client, db):
    cust = db.query(User).filter(User.email == "test_customer@example.com").first()
    if not cust:
        cust = User(
            email="test_customer@example.com",
            hashed_password=hash_password("Customer@123"),
            full_name="Test Customer",
            role="customer",
            is_active=True
        )
        db.add(cust)
        db.commit()

    res = client.post("/api/auth/login", json={
        "email": "test_customer@example.com",
        "password": "Customer@123"
    })
    return res.json()["access_token"]
