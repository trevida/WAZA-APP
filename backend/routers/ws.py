from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Conversation, Message, Workspace, User, Contact
from services.ws_manager import ws_manager
from services.claude_ai import claude_service
from utils.auth import verify_token
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid
import asyncio
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])


class SimulateMessageRequest(BaseModel):
    content: str
    role: str = "user"


@router.websocket("/ws/conversations/{conversation_id}")
async def ws_conversation(websocket: WebSocket, conversation_id: str):
    """WebSocket for real-time conversation updates."""
    # Accept first, then validate via first message
    await websocket.accept()

    # Wait for auth token
    try:
        auth_data = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        token = auth_data.get("token")
        if not token:
            await websocket.send_json({"type": "error", "message": "Token required"})
            await websocket.close()
            return

        payload = verify_token(token)
        if not payload:
            await websocket.send_json({"type": "error", "message": "Invalid token"})
            await websocket.close()
            return

        user_id = payload.get("sub")
    except asyncio.TimeoutError:
        await websocket.close()
        return
    except Exception:
        await websocket.close()
        return

    # Register connection
    if conversation_id not in ws_manager.conversation_connections:
        ws_manager.conversation_connections[conversation_id] = set()
    ws_manager.conversation_connections[conversation_id].add(websocket)

    await websocket.send_json({"type": "connected", "conversation_id": conversation_id})

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WS error: {e}")
    finally:
        ws_manager.disconnect_conversation(websocket, conversation_id)


@router.websocket("/ws/notifications/{user_id}")
async def ws_notifications(websocket: WebSocket, user_id: str):
    """WebSocket for user-level notifications (new messages, unread count)."""
    await websocket.accept()

    try:
        auth_data = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        token = auth_data.get("token")
        if not token:
            await websocket.close()
            return

        payload = verify_token(token)
        if not payload or payload.get("sub") != user_id:
            await websocket.close()
            return
    except Exception:
        await websocket.close()
        return

    if user_id not in ws_manager.user_connections:
        ws_manager.user_connections[user_id] = set()
    ws_manager.user_connections[user_id].add(websocket)

    await websocket.send_json({"type": "connected", "user_id": user_id})

    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        ws_manager.disconnect_user(websocket, user_id)


@router.post("/conversations/{conversation_id}/simulate")
async def simulate_message(
    conversation_id: str,
    body: SimulateMessageRequest,
    db: Session = Depends(get_db)
):
    """Simulate an incoming message + AI response (for testing WebSocket flow)."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    workspace = db.query(Workspace).filter(Workspace.id == conversation.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Save user message
    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=body.content,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    user_msg_data = {
        "type": "new_message",
        "message": {
            "id": user_msg.id,
            "conversation_id": conversation_id,
            "role": "user",
            "content": user_msg.content,
            "created_at": user_msg.created_at.isoformat(),
        }
    }
    await ws_manager.send_to_conversation(conversation_id, user_msg_data)
    await ws_manager.send_to_user(workspace.user_id, {
        "type": "new_message_notification",
        "conversation_id": conversation_id,
        "preview": body.content[:50],
    })

    # Send typing indicator
    await ws_manager.send_to_conversation(conversation_id, {"type": "typing", "is_typing": True})

    # Generate AI response
    try:
        history = []
        msgs = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
        for m in msgs:
            history.append({"role": m.role, "content": m.content})

        reply = await claude_service.generate_response(
            system_prompt="Tu es un assistant commercial IA pour une entreprise africaine. Réponds de manière professionnelle et chaleureuse en français.",
            conversation_history=history[:-1],
            user_message=body.content,
            session_id=conversation_id,
        )
    except Exception as e:
        logger.error(f"AI response error: {e}")
        reply = "Désolé, je rencontre un problème technique."

    # Stop typing
    await ws_manager.send_to_conversation(conversation_id, {"type": "typing", "is_typing": False})

    # Save AI message
    ai_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="assistant",
        content=reply,
    )
    db.add(ai_msg)
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ai_msg)

    ai_msg_data = {
        "type": "new_message",
        "message": {
            "id": ai_msg.id,
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": ai_msg.content,
            "created_at": ai_msg.created_at.isoformat(),
        }
    }
    await ws_manager.send_to_conversation(conversation_id, ai_msg_data)
    await ws_manager.send_to_user(workspace.user_id, {
        "type": "new_message_notification",
        "conversation_id": conversation_id,
        "preview": reply[:50],
    })

    return {
        "user_message": user_msg_data["message"],
        "ai_message": ai_msg_data["message"],
    }
