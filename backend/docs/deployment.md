# Bizora Backend Deployment Guide

## 1. Prerequisites

- Node.js LTS (v20.x or v22.x)
- MySQL 8.0+ server with an existing database named `bizora`
- Reverse proxy (Nginx or AWS ALB / Cloudflare) with SSL termination
- Process manager (PM2, Docker, or systemd)

## 2. Environment Setup

Create the production environment file `backend/.env` based on `backend/.env.example`:

```bash
PORT=5000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=bizora_app
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=bizora

JWT_ACCESS_SECRET=GENERATE_A_64_CHAR_RANDOM_SECRET_KEY
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=GENERATE_ANOTHER_64_CHAR_RANDOM_SECRET_KEY
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=https://bizora.yourdomain.com
API_BASE_URL=https://api.bizora.yourdomain.com

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

## 3. Database Migration Execution

All schema creation is handled via Sequelize Migrations. **Do not execute raw SQL scripts or recreate the database.**

To execute all pending migrations safely:
```bash
npm run db:migrate
```

To verify the migration status:
```bash
npm run db:migrate:status
```

To populate initial development or staging seed data (optional):
```bash
npm run db:seed
```

## 4. Starting the Server

### Production with PM2
```bash
npm install -g pm2
pm2 start src/server.js --name "bizora-api" -i max
pm2 save
pm2 startup
```

### Health Check Monitoring
Configure uptime monitoring to ping:
`GET https://api.bizora.yourdomain.com/health`
Expected response:
```json
{
  "status": "ok",
  "uptime": 12450.2,
  "database": {
    "status": "connected"
  }
}
```

