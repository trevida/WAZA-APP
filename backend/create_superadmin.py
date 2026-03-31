#!/usr/bin/env python3
"""Create or update superadmin user on startup."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User, PlanType
from utils.auth import hash_password

def create_superadmin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@waza.africa").first()
        if existing:
            existing.is_superadmin = True
            existing.is_active = True
            existing.password_hash = hash_password("WazaAdmin2026!")
            db.commit()
            print("Superadmin updated: admin@waza.africa")
        else:
            admin = User(
                email="admin@waza.africa",
                password_hash=hash_password("WazaAdmin2026!"),
                full_name="WAZA Admin",
                company_name="WAZA Platform",
                country="SN",
                plan=PlanType.BUSINESS,
                is_superadmin=True,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            print("Superadmin created: admin@waza.africa")
    except Exception as e:
        print(f"Superadmin creation error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
