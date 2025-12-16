"""
Tests for authentication system.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import get_db, Base
from app.services.auth_service import AuthService


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_user(setup_database):
    """Test user creation."""
    db = TestingSessionLocal()
    try:
        user = AuthService.create_user(
            db=db,
            username="testuser",
            password="testpass123",
            email="test@example.com"
        )
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.is_active is True
    finally:
        db.close()


def test_authenticate_user(setup_database):
    """Test user authentication."""
    db = TestingSessionLocal()
    try:
        # Create user first
        AuthService.create_user(
            db=db,
            username="authtest",
            password="password123"
        )
        
        # Test successful authentication
        user = AuthService.authenticate_user(db, "authtest", "password123")
        assert user is not None
        assert user.username == "authtest"
        
        # Test failed authentication
        user = AuthService.authenticate_user(db, "authtest", "wrongpassword")
        assert user is None
        
    finally:
        db.close()


def test_login_endpoint(setup_database):
    """Test login API endpoint."""
    # Create test user
    db = TestingSessionLocal()
    try:
        AuthService.create_user(
            db=db,
            username="apitest",
            password="apipass123"
        )
    finally:
        db.close()
    
    # Test successful login
    response = client.post(
        "/api/auth/login",
        json={"username": "apitest", "password": "apipass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "apitest"
    
    # Test failed login
    response = client.post(
        "/api/auth/login",
        json={"username": "apitest", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_protected_endpoint(setup_database):
    """Test protected endpoint access."""
    # Create test user and login
    db = TestingSessionLocal()
    try:
        AuthService.create_user(
            db=db,
            username="protectedtest",
            password="protectedpass123"
        )
    finally:
        db.close()
    
    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={"username": "protectedtest", "password": "protectedpass123"}
    )
    token = login_response.json()["access_token"]
    
    # Test accessing protected endpoint with token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "protectedtest"
    
    # Test accessing protected endpoint without token
    response = client.get("/api/auth/me")
    assert response.status_code == 401