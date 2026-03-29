# WAZA API Examples

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:8001/api
```

## Authentication Examples

### 1. Register New User
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "company_name": "My Business",
    "phone": "+221701234567",
    "country": "SN"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "full_name": "John Doe",
    "plan": "free",
    "is_active": true
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Refresh Token
```bash
curl -X POST http://localhost:8001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your-refresh-token"
  }'
```

## Workspace Examples

### 1. Create Workspace
```bash
curl -X POST http://localhost:8001/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Mon Entreprise"
  }'
```

### 2. List Workspaces
```bash
curl -X GET http://localhost:8001/api/workspaces \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Connect WhatsApp
```bash
curl -X POST http://localhost:8001/api/workspaces/{workspace_id}/connect-whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "whatsapp_phone_number_id": "1234567890",
    "whatsapp_access_token": "EAAxxxxxxxxxx"
  }'
```

## Agent Examples

### 1. Create Sales Agent
```bash
curl -X POST http://localhost:8001/api/workspaces/{workspace_id}/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Assistant Commercial",
    "module": "sell",
    "system_prompt": "Tu es un assistant commercial professionnel. Aide les clients à découvrir nos produits et guide-les vers l'achat.",
    "language": "fr"
  }'
```

### 2. Create Reminder Agent
```bash
curl -X POST http://localhost:8001/api/workspaces/{workspace_id}/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Rappel Rendez-vous",
    "module": "remind",
    "system_prompt": "Tu es un assistant de rappel. Confirme les rendez-vous et envoie des rappels courtois.",
    "language": "both"
  }'
```

### 3. Test Agent
```bash
curl -X POST http://localhost:8001/api/agents/{agent_id}/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "test_message": "Bonjour, je voudrais des informations sur vos services",
    "test_phone_number": "+221701234567"
  }'
```

## Contact Examples

### 1. Add Contact
```bash
curl -X POST http://localhost:8001/api/workspaces/{workspace_id}/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "phone_number": "+221701234567",
    "name": "Client Exemple",
    "tags": ["prospect", "lead"]
  }'
```

### 2. Import Contacts (Bulk)
```bash
curl -X POST http://localhost:8001/api/workspaces/{workspace_id}/contacts/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "contacts": [
      {
        "phone_number": "+221701111111",
        "name": "Client 1",
        "tags": ["vip"]
      },
      {
        "phone_number": "+221702222222",
        "name": "Client 2",
        "tags": ["prospect"]
      }
    ]
  }'
```

## Conversation Examples

### 1. List Conversations
```bash
curl -X GET http://localhost:8001/api/workspaces/{workspace_id}/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Get Conversation Messages
```bash
curl -X GET http://localhost:8001/api/conversations/{conversation_id}/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Broadcast Examples

### 1. Create Broadcast
```bash
curl -X POST http://localhost:8001/api/workspaces/{workspace_id}/broadcasts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "message_template": "🎉 Nouvelle promotion! Profitez de -20% sur tous nos produits ce weekend!",
    "target_tags": ["vip", "customer"],
    "agent_id": "agent-uuid-here"
  }'
```

### 2. Send Broadcast
```bash
curl -X POST http://localhost:8001/api/broadcasts/{broadcast_id}/send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Broadcast Stats
```bash
curl -X GET http://localhost:8001/api/broadcasts/{broadcast_id}/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Billing Examples

### 1. Get Available Plans
```bash
curl -X GET http://localhost:8001/api/billing/plans
```

### 2. Subscribe (Stripe)
```bash
curl -X POST http://localhost:8001/api/billing/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "plan": "pro",
    "payment_provider": "stripe"
  }'
```

Response:
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "provider": "stripe"
}
```

### 3. Check Payment Status
```bash
curl -X GET http://localhost:8001/api/billing/checkout/status/{session_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Analytics Examples

### 1. Get Overview
```bash
curl -X GET http://localhost:8001/api/analytics/workspaces/{workspace_id}/overview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "total_conversations": 150,
  "active_conversations": 45,
  "total_messages": 3200,
  "messages_this_month": 450,
  "message_limit": 8000,
  "usage_percentage": 5.62
}
```

### 2. Get Message Analytics
```bash
curl -X GET http://localhost:8001/api/analytics/workspaces/{workspace_id}/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Conversion Analytics
```bash
curl -X GET http://localhost:8001/api/analytics/workspaces/{workspace_id}/conversions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## WhatsApp Webhook Examples

### 1. Verify Webhook (GET)
```
https://your-domain.com/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=challenge_string
```

### 2. Incoming Message (POST)
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "221701234567",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "text": {
            "body": "Bonjour, je voudrais des informations"
          },
          "type": "text"
        }]
      }
    }]
  }]
}
```

## Common Error Responses

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "detail": "Message limit reached for free plan. Please upgrade."
}
```

### 404 Not Found
```json
{
  "detail": "Workspace not found"
}
```

## Rate Limiting

- Rate limits are enforced per IP address
- Default: 100 requests per minute
- Headers returned:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1234567890

## Webhooks

### Stripe Webhook
```
POST /api/billing/webhook/stripe
```

### CinetPay Webhook
```
POST /api/billing/webhook/cinetpay
```

### WhatsApp Webhook
```
GET/POST /api/webhook/whatsapp
```

## Environment Setup

### Required Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/waza_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-secret-key
EMERGENT_LLM_KEY=sk-emergent-xxx
STRIPE_API_KEY=sk_test_xxx
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

## Testing the Full Flow

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User","country":"SN"}' \
  | jq -r '.access_token')

# 2. Create Workspace
WORKSPACE_ID=$(curl -s -X POST http://localhost:8001/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Workspace"}' \
  | jq -r '.id')

# 3. Create Agent
AGENT_ID=$(curl -s -X POST http://localhost:8001/api/workspaces/$WORKSPACE_ID/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Sales Agent",
    "module":"sell",
    "system_prompt":"Professional sales assistant",
    "language":"both"
  }' \
  | jq -r '.id')

# 4. Test Agent
curl -X POST http://localhost:8001/api/agents/$AGENT_ID/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"test_message":"Hello, I need help","test_phone_number":"+221700000000"}'
```
