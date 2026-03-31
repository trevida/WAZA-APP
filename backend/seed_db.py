#!/usr/bin/env python3
"""
WAZA Database Seeder

Seeds the database with demo data for testing.
"""

import sys
sys.path.insert(0, '/app/backend')

from database import SessionLocal
from models import User, Workspace, Agent, Contact, ModuleType, LanguageType, PlanType
from utils.auth import hash_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database():
    """Seed database with demo data"""
    db = SessionLocal()
    
    try:
        # --- Superadmin ---
        existing_admin = db.query(User).filter(User.email == "admin@waza.africa").first()
        if not existing_admin:
            admin_user = User(
                email="admin@waza.africa",
                password_hash=hash_password("WazaAdmin2026!"),
                full_name="WAZA Admin",
                company_name="WAZA Platform",
                phone="+221700000001",
                country="SN",
                plan=PlanType.BUSINESS,
                is_active=True,
                is_verified=True,
                is_superadmin=True
            )
            db.add(admin_user)
            db.flush()
            logger.info("Superadmin created: admin@waza.africa")
        else:
            logger.info("Superadmin already exists.")

        # --- Demo user ---
        existing_user = db.query(User).filter(User.email == "demo@waza.africa").first()
        
        if existing_user:
            logger.info("Demo data already exists. Skipping seed.")
            db.commit()
            return
        
        logger.info("Seeding database with demo data...")
        
        # Create demo user
        demo_user = User(
            email="demo@waza.africa",
            password_hash=hash_password("Password123!"),
            full_name="Demo User",
            company_name="Massudom SV",
            phone="+221700000000",
            country="SN",
            plan=PlanType.FREE,
            is_active=True,
            is_verified=True
        )
        db.add(demo_user)
        db.flush()
        
        # Create workspace
        workspace = Workspace(
            user_id=demo_user.id,
            name="Ma Première Entreprise",
            message_limit=100
        )
        db.add(workspace)
        db.flush()
        
        # Create agents
        agents_data = [
            {
                "name": "Assistant Commercial",
                "module": ModuleType.SELL,
                "system_prompt": "Tu es un assistant commercial professionnel pour une entreprise sénégalaise. Ton rôle est de qualifier les prospects, répondre aux questions sur les produits, et conduire les clients vers l'achat. Sois courtois, professionnel et persuasif.",
                "language": LanguageType.FR
            },
            {
                "name": "Rappel Rendez-vous",
                "module": ModuleType.REMIND,
                "system_prompt": "Tu es un assistant de rappel de rendez-vous. Ton rôle est de confirmer les rendez-vous, envoyer des rappels 24h et 1h avant, et gérer les reprogrammations. Sois poli et efficace.",
                "language": LanguageType.BOTH
            }
        ]
        
        for agent_data in agents_data:
            agent = Agent(
                workspace_id=workspace.id,
                name=agent_data["name"],
                module=agent_data["module"],
                system_prompt=agent_data["system_prompt"],
                language=agent_data["language"],
                is_active=True
            )
            db.add(agent)
        
        # Create demo contacts
        contacts_data = [
            {"phone_number": "+221701111111", "name": "Client VIP 1", "tags": ["vip", "customer"]},
            {"phone_number": "+221702222222", "name": "Prospect Intéressé", "tags": ["prospect", "hot"]},
            {"phone_number": "+221703333333", "name": "Client Régulier", "tags": ["customer"]},
        ]
        
        for contact_data in contacts_data:
            contact = Contact(
                workspace_id=workspace.id,
                phone_number=contact_data["phone_number"],
                name=contact_data["name"],
                tags=contact_data["tags"]
            )
            db.add(contact)
        
        db.commit()
        
        logger.info("\n" + "="*60)
        logger.info("✅ Database seeded successfully!")
        logger.info("="*60)
        logger.info("\nDemo Account:")
        logger.info(f"  Email: demo@waza.africa")
        logger.info(f"  Password: Password123!")
        logger.info(f"  Plan: Free (100 messages/month)")
        logger.info(f"\nCreated:")
        logger.info(f"  - 1 Workspace: {workspace.name}")
        logger.info(f"  - {len(agents_data)} Agents")
        logger.info(f"  - {len(contacts_data)} Contacts")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
