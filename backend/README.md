# WAZA Backend - AI WhatsApp Agent Platform

**Massudom Silicon Valley** - Production-Ready FastAPI Backend

## Overview

WAZA is a SaaS platform that enables African businesses to deploy AI-powered WhatsApp agents for customer engagement, sales, reminders, and debt collection.

## Tech Stack

- **Framework**: FastAPI + Python 3.11
- **Database**: PostgreSQL 15 with SQLAlchemy ORM
- **Migrations**: Alembic
- **Cache/Queue**: Redis + Celery
- **AI**: Claude Sonnet 4.5 (via Emergent LLM integrations)
- **Payments**: 
  - Stripe (international payments)
  - CinetPay (African mobile money - mocked)
- **WhatsApp**: WhatsApp Business Cloud API (mocked for development)

## Features

### Authentication & User Management
- User registration with email verification
- JWT-based authentication (access + refresh tokens)
- Password reset flow
- Multi-plan support (Free, Starter, Pro, Business)

### Workspace Management
- Multiple workspaces per user (plan-dependent)
- WhatsApp Business account connection
- Usage tracking and limits

### AI Agents
- 4 module types: Sell, Remind, Collect, Broadcast
- Customizable system prompts
- Multi-language support (French, English, Both)
- Real-time WhatsApp integration
- Conversation history management

### Billing & Subscriptions
- Flexible plan limits enforcement
- Stripe integration for international payments
- CinetPay for African mobile money
- Webhook handlers for payment events
- Automatic plan upgrades/downgrades

### Analytics & Reporting
- Message usage tracking
- Conversation metrics
- Lead conversion analytics
- Monthly usage logs

## Setup

### Prerequisites

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Redis
sudo apt-get install redis-server

# Python 3.11+
python --version
```

### Installation

```bash
# Clone the repository
cd /app/backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waza_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your_secret_key_here

# AI (Claude Sonnet 4.5)
EMERGENT_LLM_KEY=sk-emergent-3E790FfAb0f2d972eA

# WhatsApp (mock for development)
WHATSAPP_APP_SECRET=mock_secret
WHATSAPP_VERIFY_TOKEN=waza_verify_token

# Payments
STRIPE_API_KEY=sk_test_emergent
CINETPAY_API_KEY=placeholder
CINETPAY_SITE_ID=placeholder
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Workspaces
- `GET /api/workspaces` - List workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/{id}` - Get workspace
- `PUT /api/workspaces/{id}` - Update workspace
- `DELETE /api/workspaces/{id}` - Delete workspace
- `POST /api/workspaces/{id}/connect-whatsapp` - Connect WhatsApp

### Agents
- `GET /api/workspaces/{id}/agents` - List agents
- `POST /api/workspaces/{id}/agents` - Create agent
- `GET /api/agents/{id}` - Get agent
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent
- `POST /api/agents/{id}/test` - Test agent

### Contacts
- `GET /api/workspaces/{id}/contacts` - List contacts
- `POST /api/workspaces/{id}/contacts` - Create contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact
- `POST /api/workspaces/{id}/contacts/import` - Import contacts (bulk)

### Conversations
- `GET /api/workspaces/{id}/conversations` - List conversations
- `GET /api/conversations/{id}/messages` - Get conversation messages
- `POST /api/conversations/{id}/close` - Close conversation

### Billing
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/subscribe` - Create subscription (initiate payment)
- `GET /api/billing/subscription` - Get current subscription
- `POST /api/billing/cancel` - Cancel subscription
- `GET /api/billing/checkout/status/{session_id}` - Check payment status
- `POST /api/billing/webhook/stripe` - Stripe webhook handler
- `POST /api/billing/webhook/cinetpay` - CinetPay webhook handler

### WhatsApp Webhooks
- `GET /api/webhook/whatsapp` - Verify webhook
- `POST /api/webhook/whatsapp` - Handle incoming messages

## Plan Limits

| Plan | Price (FCFA) | Messages/Month | Agents | Workspaces |
|------|-------------|----------------|--------|------------|
| Free | 0 | 100 | 1 | 1 |
| Starter | 19,900 | 1,500 | 1 | 1 |
| Pro | 49,900 | 8,000 | 5 | 3 |
| Business | 99,000 | Unlimited | Unlimited | Unlimited |

## AI Agent Workflow

1. **Incoming WhatsApp Message**
   - Webhook receives message from WhatsApp
   - Identify workspace by phone number
   - Check message limits

2. **Contact & Conversation Management**
   - Find or create contact
   - Find or create open conversation
   - Save user message

3. **AI Response Generation**
   - Load conversation history (last 20 messages)
   - Call Claude Sonnet 4.5 with agent's system prompt
   - Generate contextual response

4. **Response Delivery**
   - Send AI response via WhatsApp
   - Save assistant message
   - Update usage metrics

## Database Schema

### Core Tables
- `users` - User accounts
- `workspaces` - Business workspaces
- `agents` - AI agents configuration
- `contacts` - Customer contacts
- `conversations` - Conversation threads
- `messages` - Individual messages
- `broadcasts` - Broadcast campaigns
- `subscriptions` - User subscriptions
- `usage_logs` - Monthly usage tracking
- `payment_transactions` - Payment records

## Development

### Running Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Testing

```bash
# Test authentication
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "country": "SN"
  }'

# Test health check
curl http://localhost:8001/api/health
```

## Production Deployment

### Docker Setup

```bash
# Build
docker build -t waza-backend .

# Run
docker run -p 8001:8001 --env-file .env waza-backend
```

### Docker Compose

```bash
docker-compose up -d
```

## Architecture Notes

### Message Limit Enforcement
- Checked on every incoming WhatsApp message
- Monthly counter reset handled by Celery task
- Upgrade prompts sent automatically when limit reached

### Payment Flow
1. User selects plan
2. Backend creates checkout session (Stripe or CinetPay)
3. User completes payment on provider site
4. Webhook confirms payment
5. Subscription activated, user plan upgraded

### AI Integration
- Uses Emergent LLM universal key
- Supports Claude Sonnet 4.5
- Conversation history managed in PostgreSQL
- Session-based context for coherent responses

## Monitoring

- Structured logging to stdout
- Request/response logging
- Error tracking
- Usage metrics in database

## Security

- Bcrypt password hashing
- JWT with expiration
- CORS configuration
- Webhook signature verification
- Rate limiting (Redis)
- SQL injection protection (SQLAlchemy ORM)

## Support

For issues and questions:
- Email: support@massudomsv.com
- Documentation: https://docs.waza.africa

---

**Built with ❤️ by Massudom Silicon Valley**
