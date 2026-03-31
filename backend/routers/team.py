from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Workspace, WorkspaceMember, User, MemberRole, InviteStatus
from utils.dependencies import get_current_active_user
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Team"])


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "member"


class UpdateMemberRequest(BaseModel):
    role: str


class MemberResponse(BaseModel):
    id: str
    workspace_id: str
    user_id: Optional[str] = None
    email: str
    role: str
    status: str
    invited_by_name: Optional[str] = None
    user_name: Optional[str] = None
    created_at: datetime
    accepted_at: Optional[datetime] = None


def _check_workspace_access(db: Session, workspace_id: str, user: User, require_admin: bool = False):
    """Check if user has access to workspace (owner or member)"""
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace introuvable")

    if workspace.user_id == user.id:
        return workspace, "owner"

    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user.id,
        WorkspaceMember.status == "active",
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Acces refuse")

    if require_admin and member.role == "member":
        raise HTTPException(status_code=403, detail="Droits admin requis")

    return workspace, member.role


@router.get("/workspaces/{workspace_id}/members")
async def list_members(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    workspace, _ = _check_workspace_access(db, workspace_id, current_user)

    # Owner
    owner = db.query(User).filter(User.id == workspace.user_id).first()
    members_list = []
    if owner:
        members_list.append({
            "id": "owner",
            "workspace_id": workspace_id,
            "user_id": owner.id,
            "email": owner.email,
            "role": "owner",
            "status": "active",
            "user_name": owner.full_name,
            "invited_by_name": None,
            "created_at": workspace.created_at.isoformat(),
            "accepted_at": workspace.created_at.isoformat(),
        })

    # Members
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
    ).order_by(WorkspaceMember.created_at.desc()).all()

    for m in members:
        user_name = None
        if m.user_id:
            u = db.query(User).filter(User.id == m.user_id).first()
            if u:
                user_name = u.full_name
        inviter_name = None
        if m.invited_by:
            inv = db.query(User).filter(User.id == m.invited_by).first()
            if inv:
                inviter_name = inv.full_name
        members_list.append({
            "id": m.id,
            "workspace_id": m.workspace_id,
            "user_id": m.user_id,
            "email": m.email,
            "role": m.role.value if hasattr(m.role, 'value') else m.role,
            "status": m.status.value if hasattr(m.status, 'value') else m.status,
            "user_name": user_name,
            "invited_by_name": inviter_name,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "accepted_at": m.accepted_at.isoformat() if m.accepted_at else None,
        })

    return {"members": members_list, "total": len(members_list)}


@router.post("/workspaces/{workspace_id}/members/invite")
async def invite_member(
    workspace_id: str,
    body: InviteMemberRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    workspace, role = _check_workspace_access(db, workspace_id, current_user, require_admin=True)

    if body.role not in ["admin", "member"]:
        raise HTTPException(status_code=422, detail="Role invalide. Utilisez 'admin' ou 'member'")

    # Check not inviting self
    if body.email == current_user.email:
        raise HTTPException(status_code=422, detail="Vous ne pouvez pas vous inviter vous-meme")

    # Check not already a member or pending
    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.email == body.email,
        WorkspaceMember.status.in_(["pending", "active"]),
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Cet email est deja membre ou invite")

    # Check if owner
    if workspace.user_id:
        owner = db.query(User).filter(User.id == workspace.user_id).first()
        if owner and owner.email == body.email:
            raise HTTPException(status_code=409, detail="Cet email est le proprietaire du workspace")

    invite_token = str(uuid.uuid4())

    # Check if user already registered
    existing_user = db.query(User).filter(User.email == body.email).first()

    new_member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=existing_user.id if existing_user else None,
        email=body.email,
        role=body.role,
        status="pending",
        invite_token=invite_token,
        invited_by=current_user.id,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    logger.info(f"Invitation sent: {body.email} -> workspace {workspace_id} as {body.role}")

    return {
        "message": f"Invitation envoyee a {body.email}",
        "member_id": new_member.id,
        "invite_token": invite_token,
        "status": "pending",
    }


@router.post("/workspaces/invitations/{token}/accept")
async def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.invite_token == token,
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Invitation introuvable ou expiree")

    if member.status == "active":
        raise HTTPException(status_code=400, detail="Invitation deja acceptee")

    if member.email != current_user.email:
        raise HTTPException(status_code=403, detail="Cette invitation n'est pas pour vous")

    member.status = "active"
    member.user_id = current_user.id
    member.accepted_at = datetime.now(timezone.utc)
    member.invite_token = None
    db.commit()

    workspace = db.query(Workspace).filter(Workspace.id == member.workspace_id).first()

    logger.info(f"Invitation accepted: {current_user.email} joined workspace {member.workspace_id}")

    return {
        "message": f"Vous avez rejoint le workspace '{workspace.name if workspace else ''}'",
        "workspace_id": member.workspace_id,
        "role": member.role.value if hasattr(member.role, 'value') else member.role,
    }


@router.put("/workspaces/{workspace_id}/members/{member_id}")
async def update_member_role(
    workspace_id: str,
    member_id: str,
    body: UpdateMemberRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    _check_workspace_access(db, workspace_id, current_user, require_admin=True)

    if body.role not in ["admin", "member"]:
        raise HTTPException(status_code=422, detail="Role invalide")

    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.id == member_id,
        WorkspaceMember.workspace_id == workspace_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membre introuvable")

    member.role = body.role
    db.commit()

    logger.info(f"Member role updated: {member.email} -> {body.role}")
    return {"message": f"Role mis a jour: {body.role}", "member_id": member_id}


@router.delete("/workspaces/{workspace_id}/members/{member_id}")
async def remove_member(
    workspace_id: str,
    member_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    workspace, caller_role = _check_workspace_access(db, workspace_id, current_user, require_admin=True)

    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.id == member_id,
        WorkspaceMember.workspace_id == workspace_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membre introuvable")

    db.delete(member)
    db.commit()

    logger.info(f"Member removed: {member.email} from workspace {workspace_id}")
    return {"message": f"{member.email} a ete retire du workspace"}


@router.get("/workspaces/my-invitations")
async def my_pending_invitations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    invitations = db.query(WorkspaceMember).filter(
        WorkspaceMember.email == current_user.email,
        WorkspaceMember.status == "pending",
    ).all()

    result = []
    for inv in invitations:
        ws = db.query(Workspace).filter(Workspace.id == inv.workspace_id).first()
        inviter = db.query(User).filter(User.id == inv.invited_by).first() if inv.invited_by else None
        result.append({
            "id": inv.id,
            "workspace_id": inv.workspace_id,
            "workspace_name": ws.name if ws else "Inconnu",
            "role": inv.role.value if hasattr(inv.role, 'value') else inv.role,
            "invite_token": inv.invite_token,
            "invited_by_name": inviter.full_name if inviter else "Inconnu",
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
        })

    return {"invitations": result, "total": len(result)}
