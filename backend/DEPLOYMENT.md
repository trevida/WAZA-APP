# WAZA Backend - Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Migrations](#database-migrations)
6. [Monitoring & Logging](#monitoring--logging)

---

## Local Development

### Prerequisites
- Python 3.11+
- PostgreSQL 15
- Redis 7
- pip/virtualenv

### Setup Steps

1. **Install System Dependencies**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib redis-server python3.11 python3.11-venv

# macOS (Homebrew)
brew install postgresql@15 redis python@3.11
```

2. **Create Virtual Environment**
```bash
cd /app/backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python Dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup PostgreSQL**
```bash
# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql@15  # macOS

# Create database
sudo -u postgres psql
CREATE DATABASE waza_db;
CREATE USER waza_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE waza_db TO waza_user;
\q
```

5. **Setup Redis**
```bash
# Start Redis
sudo service redis-server start  # Linux
brew services start redis  # macOS
```

6. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

7. **Run Migrations**
```bash
alembic upgrade head
```

8. **Start Development Server**
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

9. **Start Celery Worker (Optional)**
```bash
# In a separate terminal
celery -A tasks.celery_app worker --loglevel=info
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Prerequisites**
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env - no need to change DATABASE_URL or REDIS_URL
```

3. **Build and Run**
```bash
docker-compose up -d
```

4. **View Logs**
```bash
docker-compose logs -f backend
```

5. **Run Migrations**
```bash
docker-compose exec backend alembic upgrade head
```

6. **Stop Services**
```bash
docker-compose down
```

### Using Docker Only

1. **Build Image**
```bash
docker build -t waza-backend .
```

2. **Run Container**
```bash
docker run -d \
  --name waza-backend \
  -p 8001:8001 \
  --env-file .env \
  waza-backend
```

---

## Production Deployment

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

1. **Server Setup**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y python3.11 python3.11-venv postgresql redis-server nginx certbot python3-certbot-nginx
```

2. **Application Setup**
```bash
# Clone repository
git clone https://github.com/your-org/waza-backend.git
cd waza-backend

# Create production user
sudo useradd -m -s /bin/bash waza
sudo chown -R waza:waza /home/waza

# Setup application
sudo -u waza python3.11 -m venv venv
sudo -u waza venv/bin/pip install -r requirements.txt
```

3. **Configure Systemd Service**

Create `/etc/systemd/system/waza-backend.service`:
```ini
[Unit]
Description=WAZA Backend API
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=waza
Group=waza
WorkingDirectory=/home/waza/waza-backend
Environment="PATH=/home/waza/waza-backend/venv/bin"
ExecStart=/home/waza/waza-backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

4. **Configure Celery Worker**

Create `/etc/systemd/system/waza-celery.service`:
```ini
[Unit]
Description=WAZA Celery Worker
After=network.target redis.service

[Service]
Type=simple
User=waza
Group=waza
WorkingDirectory=/home/waza/waza-backend
Environment="PATH=/home/waza/waza-backend/venv/bin"
ExecStart=/home/waza/waza-backend/venv/bin/celery -A tasks.celery_app worker --loglevel=info
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

5. **Configure Nginx**

Create `/etc/nginx/sites-available/waza`:
```nginx
server {
    listen 80;
    server_name api.waza.africa;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. **Enable Services**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/waza /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Enable SSL
sudo certbot --nginx -d api.waza.africa

# Start services
sudo systemctl enable waza-backend waza-celery
sudo systemctl start waza-backend waza-celery
```

### Option 2: Kubernetes

1. **Create Deployment**

`kubernetes/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: waza-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: waza-backend
  template:
    metadata:
      labels:
        app: waza-backend
    spec:
      containers:
      - name: backend
        image: your-registry/waza-backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: waza-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: waza-secrets
              key: redis-url
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: waza-secrets
              key: jwt-secret
```

2. **Create Service**

`kubernetes/service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: waza-backend-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8001
  selector:
    app: waza-backend
```

3. **Deploy**
```bash
kubectl apply -f kubernetes/
```

---

## Environment Configuration

### Development (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waza_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=dev_secret_key_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI
EMERGENT_LLM_KEY=sk-emergent-your-key

# WhatsApp (Mock)
WHATSAPP_APP_SECRET=mock_secret
WHATSAPP_VERIFY_TOKEN=dev_verify_token

# Payments
STRIPE_API_KEY=sk_test_your_key
CINETPAY_API_KEY=placeholder
CINETPAY_SITE_ID=placeholder

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Production (.env.production)
```bash
# Database (use managed service)
DATABASE_URL=postgresql://user:password@db-host:5432/waza_prod

# Redis (use managed service)
REDIS_URL=redis://redis-host:6379/0

# JWT (use strong random keys)
JWT_SECRET_KEY=GENERATE_STRONG_RANDOM_KEY_HERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI
EMERGENT_LLM_KEY=sk-emergent-production-key

# WhatsApp (real credentials)
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Payments (production keys)
STRIPE_API_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
CINETPAY_API_KEY=production_key
CINETPAY_SITE_ID=production_site_id

# CORS (production domains)
CORS_ORIGINS=https://app.waza.africa,https://www.waza.africa

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
FROM_EMAIL=noreply@waza.africa
```

---

## Database Migrations

### Create Migration
```bash
alembic revision --autogenerate -m "description of changes"
```

### Apply Migrations
```bash
# Upgrade to latest
alembic upgrade head

# Upgrade to specific version
alembic upgrade <revision_id>

# Downgrade one version
alembic downgrade -1

# Show current version
alembic current

# Show migration history
alembic history
```

### Production Migration Strategy
```bash
# 1. Backup database
pg_dump waza_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on staging
alembic upgrade head

# 3. Apply to production
alembic upgrade head

# 4. If issues, rollback
alembic downgrade -1
```

---

## Monitoring & Logging

### Application Logs
```bash
# Development
tail -f logs/app.log

# Production (systemd)
sudo journalctl -u waza-backend -f

# Docker
docker-compose logs -f backend
```

### Health Checks
```bash
# Health endpoint
curl https://api.waza.africa/api/health

# Database check
psql -h localhost -U waza_user -d waza_db -c "SELECT 1;"

# Redis check
redis-cli ping
```

### Metrics (Optional - Prometheus)

Add to `server.py`:
```python
from prometheus_fastapi_instrumentator import Instrumentator

# After app creation
Instrumentator().instrument(app).expose(app)
```

---

## Security Checklist

- [ ] Change default JWT_SECRET_KEY
- [ ] Use HTTPS in production (SSL certificates)
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for all secrets
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Rate limiting enabled
- [ ] Webhook signature verification
- [ ] SQL injection protection (ORM)
- [ ] Password hashing (bcrypt)

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql $DATABASE_URL

# Reset password
sudo -u postgres psql
ALTER USER waza_user PASSWORD 'new_password';
```

### Redis Connection Issues
```bash
# Check Redis is running
sudo systemctl status redis

# Test connection
redis-cli ping

# Check logs
sudo tail -f /var/log/redis/redis-server.log
```

### Application Not Starting
```bash
# Check logs
sudo journalctl -u waza-backend -n 100

# Check port availability
sudo lsof -i :8001

# Restart service
sudo systemctl restart waza-backend
```

---

## Backup Strategy

### Database Backups
```bash
# Daily automated backup (cron)
0 2 * * * pg_dump waza_db | gzip > /backups/waza_$(date +\%Y\%m\%d).sql.gz

# Restore from backup
gunzip < backup.sql.gz | psql waza_db
```

### Application Backups
```bash
# Backup application directory
tar -czf waza-backend-$(date +%Y%m%d).tar.gz /home/waza/waza-backend
```

---

## Performance Tuning

### PostgreSQL
```sql
-- Increase connection pool
ALTER SYSTEM SET max_connections = 200;

-- Enable query cache
ALTER SYSTEM SET shared_buffers = '256MB';
```

### Uvicorn
```bash
# Production with multiple workers
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

### Redis
```bash
# Increase max memory
redis-cli CONFIG SET maxmemory 512mb
```

---

## Support

For deployment issues:
- Email: devops@massudomsv.com
- Docs: https://docs.waza.africa/deployment
- Slack: #waza-deployment

---

**Last Updated**: March 2026
