from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time conversations."""

    def __init__(self):
        # conversation_id -> set of websockets
        self.conversation_connections: Dict[str, Set[WebSocket]] = {}
        # user_id -> set of websockets (for global notifications)
        self.user_connections: Dict[str, Set[WebSocket]] = {}

    async def connect_conversation(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        if conversation_id not in self.conversation_connections:
            self.conversation_connections[conversation_id] = set()
        self.conversation_connections[conversation_id].add(websocket)
        logger.info(f"WS connected to conversation {conversation_id}")

    async def connect_user(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)
        logger.info(f"WS user {user_id} connected for notifications")

    def disconnect_conversation(self, websocket: WebSocket, conversation_id: str):
        if conversation_id in self.conversation_connections:
            self.conversation_connections[conversation_id].discard(websocket)
            if not self.conversation_connections[conversation_id]:
                del self.conversation_connections[conversation_id]
        logger.info(f"WS disconnected from conversation {conversation_id}")

    def disconnect_user(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_to_conversation(self, conversation_id: str, data: dict):
        if conversation_id in self.conversation_connections:
            dead = []
            for ws in self.conversation_connections[conversation_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.conversation_connections[conversation_id].discard(ws)

    async def send_to_user(self, user_id: str, data: dict):
        if user_id in self.user_connections:
            dead = []
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.user_connections[user_id].discard(ws)


ws_manager = ConnectionManager()
