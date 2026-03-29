"""initial migration

Revision ID: baf07d33bb0e
Revises: 
Create Date: 2026-03-29 03:17:26.076636

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'baf07d33bb0e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum types explicitly with create_type=False to avoid duplicate errors
    plantype = sa.Enum('FREE', 'STARTER', 'PRO', 'BUSINESS', name='plantype')
    moduletype = sa.Enum('SELL', 'REMIND', 'COLLECT', 'BROADCAST', name='moduletype')
    languagetype = sa.Enum('FR', 'EN', 'BOTH', name='languagetype')
    conversationstatus = sa.Enum('OPEN', 'CLOSED', name='conversationstatus')
    broadcaststatus = sa.Enum('DRAFT', 'SCHEDULED', 'SENT', name='broadcaststatus')
    subscriptionstatus = sa.Enum('ACTIVE', 'CANCELLED', 'PAST_DUE', name='subscriptionstatus')
    paymentprovider = sa.Enum('CINETPAY', 'STRIPE', name='paymentprovider')

    op.create_table('users',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=False),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('company_name', sa.String(), nullable=True),
    sa.Column('country', sa.String(), nullable=True),
    sa.Column('plan', plantype, nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('is_verified', sa.Boolean(), nullable=True),
    sa.Column('verification_token', sa.String(), nullable=True),
    sa.Column('reset_token', sa.String(), nullable=True),
    sa.Column('reset_token_expires', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('payment_transactions',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=True),
    sa.Column('session_id', sa.String(), nullable=True),
    sa.Column('payment_id', sa.String(), nullable=True),
    sa.Column('amount', sa.Integer(), nullable=False),
    sa.Column('currency', sa.String(), nullable=True),
    sa.Column('payment_provider', paymentprovider, nullable=False),
    sa.Column('payment_status', sa.String(), nullable=True),
    sa.Column('payment_metadata', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('session_id')
    )
    op.create_table('subscriptions',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('plan', plantype, nullable=False),
    sa.Column('status', subscriptionstatus, nullable=True),
    sa.Column('price_fcfa', sa.Integer(), nullable=False),
    sa.Column('payment_provider', paymentprovider, nullable=False),
    sa.Column('stripe_subscription_id', sa.String(), nullable=True),
    sa.Column('cinetpay_transaction_id', sa.String(), nullable=True),
    sa.Column('current_period_start', sa.DateTime(), nullable=False),
    sa.Column('current_period_end', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('workspaces',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('whatsapp_phone_number_id', sa.String(), nullable=True),
    sa.Column('whatsapp_access_token', sa.String(), nullable=True),
    sa.Column('monthly_message_count', sa.Integer(), nullable=True),
    sa.Column('message_limit', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('agents',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('workspace_id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('module', moduletype, nullable=False),
    sa.Column('system_prompt', sa.Text(), nullable=False),
    sa.Column('language', languagetype, nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('contacts',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('workspace_id', sa.String(), nullable=False),
    sa.Column('phone_number', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('tags', sa.ARRAY(sa.String()), nullable=True),
    sa.Column('last_interaction', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contacts_phone_number'), 'contacts', ['phone_number'], unique=False)
    op.create_table('usage_logs',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('workspace_id', sa.String(), nullable=False),
    sa.Column('messages_used', sa.Integer(), nullable=True),
    sa.Column('period', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('broadcasts',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('workspace_id', sa.String(), nullable=False),
    sa.Column('agent_id', sa.String(), nullable=True),
    sa.Column('message_template', sa.Text(), nullable=False),
    sa.Column('target_tags', sa.ARRAY(sa.String()), nullable=True),
    sa.Column('status', broadcaststatus, nullable=True),
    sa.Column('scheduled_at', sa.DateTime(), nullable=True),
    sa.Column('sent_at', sa.DateTime(), nullable=True),
    sa.Column('total_sent', sa.Integer(), nullable=True),
    sa.Column('total_delivered', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('conversations',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('workspace_id', sa.String(), nullable=False),
    sa.Column('agent_id', sa.String(), nullable=True),
    sa.Column('contact_id', sa.String(), nullable=False),
    sa.Column('status', conversationstatus, nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['contact_id'], ['contacts.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('messages',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('conversation_id', sa.String(), nullable=False),
    sa.Column('role', sa.String(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('whatsapp_message_id', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('broadcasts')
    op.drop_table('usage_logs')
    op.drop_index(op.f('ix_contacts_phone_number'), table_name='contacts')
    op.drop_table('contacts')
    op.drop_table('agents')
    op.drop_table('workspaces')
    op.drop_table('subscriptions')
    op.drop_table('payment_transactions')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # Drop enum types
    sa.Enum(name='plantype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='moduletype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='languagetype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='conversationstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='broadcaststatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='subscriptionstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='paymentprovider').drop(op.get_bind(), checkfirst=True)
