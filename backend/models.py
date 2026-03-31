from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, ARRAY, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import enum
import uuid

class PlanType(str, enum.Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"

class ModuleType(str, enum.Enum):
    SELL = "sell"
    REMIND = "remind"
    COLLECT = "collect"
    BROADCAST = "broadcast"

class LanguageType(str, enum.Enum):
    FR = "fr"
    EN = "en"
    BOTH = "both"

class ConversationStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"

class BroadcastStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENT = "sent"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"

class PaymentProvider(str, enum.Enum):
    CINETPAY = "cinetpay"
    STRIPE = "stripe"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    company_name = Column(String)
    country = Column(String, default="SN")  # Senegal by default
    plan = Column(SQLEnum(PlanType), default=PlanType.FREE, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superadmin = Column(Boolean, default=False)
    verification_token = Column(String)
    reset_token = Column(String)
    reset_token_expires = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    workspaces = relationship("Workspace", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")

class Workspace(Base):
    __tablename__ = "workspaces"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    whatsapp_phone_number_id = Column(String)  # Meta WhatsApp Phone Number ID
    whatsapp_access_token = Column(String)  # Meta WhatsApp Access Token
    monthly_message_count = Column(Integer, default=0)
    message_limit = Column(Integer, default=100)  # Based on plan
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="workspaces")
    agents = relationship("Agent", back_populates="workspace", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="workspace", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="workspace", cascade="all, delete-orphan")
    broadcasts = relationship("Broadcast", back_populates="workspace", cascade="all, delete-orphan")
    usage_logs = relationship("UsageLog", back_populates="workspace", cascade="all, delete-orphan")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    module = Column(SQLEnum(ModuleType), nullable=False)
    system_prompt = Column(Text, nullable=False)
    language = Column(SQLEnum(LanguageType), default=LanguageType.BOTH)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    workspace = relationship("Workspace", back_populates="agents")
    conversations = relationship("Conversation", back_populates="agent")
    broadcasts = relationship("Broadcast", back_populates="agent")

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    phone_number = Column(String, nullable=False, index=True)
    name = Column(String)
    tags = Column(ARRAY(String), default=[])
    last_interaction = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    workspace = relationship("Workspace", back_populates="contacts")
    conversations = relationship("Conversation", back_populates="contact")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="SET NULL"))
    contact_id = Column(String, ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(ConversationStatus), default=ConversationStatus.OPEN)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    workspace = relationship("Workspace", back_populates="conversations")
    agent = relationship("Agent", back_populates="conversations")
    contact = relationship("Contact", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    whatsapp_message_id = Column(String)  # WhatsApp's message ID
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

class Broadcast(Base):
    __tablename__ = "broadcasts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="SET NULL"))
    message_template = Column(Text, nullable=False)
    target_tags = Column(ARRAY(String), default=[])
    status = Column(SQLEnum(BroadcastStatus), default=BroadcastStatus.DRAFT)
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    total_sent = Column(Integer, default=0)
    total_delivered = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    workspace = relationship("Workspace", back_populates="broadcasts")
    agent = relationship("Agent", back_populates="broadcasts")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan = Column(SQLEnum(PlanType), nullable=False)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    price_fcfa = Column(Integer, nullable=False)
    payment_provider = Column(SQLEnum(PaymentProvider), nullable=False)
    stripe_subscription_id = Column(String)
    cinetpay_transaction_id = Column(String)
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")

class UsageLog(Base):
    __tablename__ = "usage_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    messages_used = Column(Integer, default=0)
    period = Column(String, nullable=False)  # Format: YYYY-MM
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    workspace = relationship("Workspace", back_populates="usage_logs")

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    session_id = Column(String, unique=True)
    payment_id = Column(String)
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="XOF")  # West African CFA franc
    payment_provider = Column(SQLEnum(PaymentProvider), nullable=False)
    payment_status = Column(String, default="pending")  # pending, paid, failed, expired
    payment_metadata = Column(Text)  # JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
