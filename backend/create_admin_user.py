"""
Script to create an admin user for the CollectiSense AI application.
"""

import sys
from pathlib import Path
import uuid
from datetime import datetime, timezone

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent))

from app.db.database import SessionLocal
from app.models.user import User
from app.services.auth_service import AuthService


def create_admin_user():
    """Create an admin user for the application"""
    
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("Admin user already exists!")
            print(f"Username: {existing_admin.username}")
            print(f"Email: {existing_admin.email}")
            print(f"Active: {existing_admin.is_active}")
            return
        
        # Create admin user
        admin_password = "Admin123!"  # Default password - should be changed after first login
        hashed_password = AuthService.get_password_hash(admin_password)
        
        admin_user = User(
            username="admin",
            email="admin@collectisense.ai",
            hashed_password=hashed_password,
            first_name="System",
            last_name="Administrator",
            is_active=True,
            is_admin=True,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"Username: {admin_user.username}")
        print(f"Email: {admin_user.email}")
        print(f"Password: {admin_password}")
        print(f"User ID: {admin_user.id}")
        print("\n⚠️  IMPORTANT: Please change the default password after first login!")
        
        # Also create a regular test user
        test_password = "Test123!"
        test_hashed_password = AuthService.get_password_hash(test_password)
        
        test_user = User(
            username="testuser",
            email="test@collectisense.ai",
            hashed_password=test_hashed_password,
            first_name="Test",
            last_name="User",
            is_active=True,
            is_admin=False,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("\n✅ Test user created successfully!")
        print(f"Username: {test_user.username}")
        print(f"Email: {test_user.email}")
        print(f"Password: {test_password}")
        print(f"User ID: {test_user.id}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def list_users():
    """List all users in the system"""
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in the system.")
            return
        
        print(f"\n📋 Found {len(users)} users:")
        print("-" * 80)
        
        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"Active: {user.is_active}")
            print(f"Created: {user.created_at}")
            print(f"Updated: {user.updated_at}")
            print(f"Last Login: {user.last_login}")
            print("-" * 80)
            
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        db.close()


def reset_admin_password():
    """Reset admin password to default"""
    
    db = SessionLocal()
    
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("❌ Admin user not found!")
            return
        
        new_password = "Admin123!"
        hashed_password = AuthService.get_password_hash(new_password)
        
        admin_user.hashed_password = hashed_password
        admin_user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        
        print("✅ Admin password reset successfully!")
        print(f"New password: {new_password}")
        print("⚠️  Please change this password after login!")
        
    except Exception as e:
        print(f"❌ Error resetting admin password: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="User management for CollectiSense AI")
    parser.add_argument("--create-admin", action="store_true", help="Create admin user")
    parser.add_argument("--list-users", action="store_true", help="List all users")
    parser.add_argument("--reset-admin", action="store_true", help="Reset admin password")
    
    args = parser.parse_args()
    
    if args.create_admin:
        create_admin_user()
    elif args.list_users:
        list_users()
    elif args.reset_admin:
        reset_admin_password()
    else:
        print("Usage:")
        print("  python create_admin_user.py --create-admin    # Create admin user")
        print("  python create_admin_user.py --list-users      # List all users")
        print("  python create_admin_user.py --reset-admin     # Reset admin password")