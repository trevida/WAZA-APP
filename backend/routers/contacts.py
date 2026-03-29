from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Contact, Workspace, User
from schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactImportRequest
from utils.dependencies import get_current_active_user
from typing import List
import logging
import csv
import io

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Contacts"])

@router.get("/workspaces/{workspace_id}/contacts", response_model=List[ContactResponse])
async def list_contacts(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all contacts for a workspace"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    contacts = db.query(Contact).filter(Contact.workspace_id == workspace_id).all()
    return contacts

@router.post("/workspaces/{workspace_id}/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    workspace_id: str,
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new contact"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Check if contact already exists
    existing = db.query(Contact).filter(
        Contact.workspace_id == workspace_id,
        Contact.phone_number == contact_data.phone_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this phone number already exists"
        )
    
    new_contact = Contact(
        workspace_id=workspace_id,
        phone_number=contact_data.phone_number,
        name=contact_data.name,
        tags=contact_data.tags
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    return new_contact

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == contact.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if contact_data.name is not None:
        contact.name = contact_data.name
    if contact_data.tags is not None:
        contact.tags = contact_data.tags
    
    db.commit()
    db.refresh(contact)
    
    return contact

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    workspace = db.query(Workspace).filter(
        Workspace.id == contact.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(contact)
    db.commit()

@router.post("/workspaces/{workspace_id}/contacts/import")
async def import_contacts(
    workspace_id: str,
    import_data: ContactImportRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Import multiple contacts"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    imported_count = 0
    skipped_count = 0
    
    for contact_data in import_data.contacts:
        # Check if already exists
        existing = db.query(Contact).filter(
            Contact.workspace_id == workspace_id,
            Contact.phone_number == contact_data.phone_number
        ).first()
        
        if existing:
            skipped_count += 1
            continue
        
        new_contact = Contact(
            workspace_id=workspace_id,
            phone_number=contact_data.phone_number,
            name=contact_data.name,
            tags=contact_data.tags
        )
        db.add(new_contact)
        imported_count += 1
    
    db.commit()
    
    return {
        "imported": imported_count,
        "skipped": skipped_count,
        "total": len(import_data.contacts)
    }
