# Adrex Media OS - Deployment Guide

## Project Structure

```
drex_media_os/
├── backend/          → Node.js + Express + Prisma (Port 5000)
├── frontend/         → Next.js Admin Dashboard (Port 3000)
├── team-portal/      → Next.js Team Portal (Port 3001)
├── shared/           → Shared Zod schemas
└── docker-compose.yml
```

---

## Option 0: One-Click Deploy with Vercel + Render (Recommended)

### Prerequisites
- Push your code to GitHub
- Have a [Groq API key](https://console.groq.com) ready

### Step 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign up → **New +** → **Blueprint**
2. Connect your GitHub repo
3. Select the `render.yaml` file at the repo root
4. Render will auto-create 4 services:
   - **adrex-backend** (Web Service)
   - **adrex-admin** (Web Service — Admin Frontend)
   - **adrex-team-portal** (Web Service — Team Portal)
   - **adrex-db** (PostgreSQL Database)
5. Fill in the required env vars marked `sync: false`:
   - `GROQ_API_KEY` — your Groq API key
   - `FRONTEND_URL` — will be auto-filled after frontend deploys
   - `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — optional, for WhatsApp
   - `SMTP_USER` / `SMTP_PASS` — optional, for email
6. Click **Apply** → Render builds and deploys everything automatically

### Step 2: Deploy Admin Frontend on Vercel (Alternative)

If you prefer Vercel for frontends instead of Render:

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
2. Set **Root Directory** to `frontend`
3. Vercel auto-detects Next.js from `vercel.json`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = <your Render backend URL>
   ```
5. Click **Deploy**

### Step 3: Deploy Team Portal on Vercel (Alternative)

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
2. Set **Root Directory** to `team-portal`
3. Vercel auto-detects Next.js from `vercel.json`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = <your Render backend URL>
   ```
5. Click **Deploy**

### Step 4: Update Backend CORS

After frontends are deployed, update `backend/src/index.ts` and `backend/src/socket.ts` with the actual Vercel URLs, then push to GitHub to trigger a Render redeploy.

---

## Option 1: Deploy on Vercel (Frontend) + Railway (Backend) — Easiest

### Step 1: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → Sign up → New Project
2. Click **Deploy from GitHub repo** → Select your repo
3. Select the `backend` folder as the root directory
4. Add a **PostgreSQL** plugin from Railway dashboard
5. Add a **Redis** plugin from Railway dashboard
6. Set environment variables in Railway:

```env
DATABASE_URL=<from Railway PostgreSQL plugin>
REDIS_URL=<from Railway Redis plugin>
JWT_SECRET=<generate a strong random string>
GROQ_API_KEY=<your Groq API key>
FRONTEND_URL=https://<your-vercel-admin-url>
NODE_ENV=production
PORT=5000
TWILIO_ACCOUNT_SID=<your Twilio SID>
TWILIO_AUTH_TOKEN=<your Twilio token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<your SMTP user>
SMTP_PASS=<your SMTP pass>
```

7. Update `backend/Dockerfile` for production:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

8. Run Prisma migrations:
   - Open Railway shell → `npx prisma migrate deploy`

9. Note your Railway backend URL (e.g., `https://backend-xxxx.up.railway.app`)

### Step 2: Deploy Admin Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Set root directory to `frontend`
3. Add environment variable:

```env
NEXT_PUBLIC_API_URL=<your Railway backend URL>
```

4. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Deploy → Vercel gives you a URL like `https://adrex-admin.vercel.app`

### Step 3: Deploy Team Portal on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Set root directory to `team-portal`
3. Add environment variable:

```env
NEXT_PUBLIC_API_URL=<your Railway backend URL>
```

4. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Deploy → Vercel gives you a URL like `https://adrex-team.vercel.app`

### Step 4: Update Backend CORS

Update `backend/src/index.ts` CORS origin to include both Vercel URLs:

```ts
app.use(cors({
  origin: ['https://adrex-admin.vercel.app', 'https://adrex-team.vercel.app'],
  credentials: true,
}));
```

And update `backend/src/socket.ts`:

```ts
cors: {
  origin: ['https://adrex-admin.vercel.app', 'https://adrex-team.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}
```

Redeploy backend after these changes.

---

## Option 2: Deploy Everything on a Single VPS (Ubuntu)

### Step 1: Server Setup

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Install Redis
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install -y nginx
systemctl enable nginx
```

### Step 2: Setup PostgreSQL Database

```bash
sudo -u postgres psql

CREATE USER adrex WITH PASSWORD 'your_secure_password';
CREATE DATABASE adrex_media OWNER adrex;
GRANT ALL PRIVILEGES ON DATABASE adrex_media TO adrex;
\q

# Set DATABASE_URL
export DATABASE_URL="postgresql://adrex:your_secure_password@localhost:5432/adrex_media"
```

### Step 3: Clone & Setup Backend

```bash
cd /opt
git clone https://github.com/your-username/drex_media_os.git
cd drex_media_os/backend

# Install dependencies
npm ci --omit=dev

# Setup environment
nano .env
```

```env
PORT=5000
DATABASE_URL=postgresql://adrex:your_secure_password@localhost:5432/adrex_media
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
GROQ_API_KEY=<your key>
FRONTEND_URL=https://admin.yourdomain.com
NODE_ENV=production
REDIS_URL=redis://localhost:6379
TWILIO_ACCOUNT_SID=<your SID>
TWILIO_AUTH_TOKEN=<your token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<user>
SMTP_PASS=<pass>
```

```bash
# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name adrex-backend
pm2 save
pm2 startup
```

### Step 4: Setup Admin Frontend

```bash
cd /opt/drex_media_os/frontend

# Install dependencies
npm ci --legacy-peer-deps

# Build
npm run build

# Start with PM2
pm2 start npm --name adrex-admin -- start -- -p 3000
pm2 save
```

### Step 5: Setup Team Portal

```bash
cd /opt/drex_media_os/team-portal

# Install dependencies
npm ci --legacy-peer-deps

# Build
npm run build

# Start with PM2
pm2 start npm --name adrex-team -- start -- -p 3001
pm2 save
```

### Step 6: Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/adrex
```

```nginx
# Admin Frontend
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Team Portal
server {
    listen 80;
    server_name team.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/adrex /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d admin.yourdomain.com -d team.yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically
```

### Step 8: Update Environment Variables

Update `backend/.env`:
```env
FRONTEND_URL=https://admin.yourdomain.com
```

Update CORS in `backend/src/index.ts`:
```ts
app.use(cors({
  origin: ['https://admin.yourdomain.com', 'https://team.yourdomain.com'],
  credentials: true,
}));
```

Update CORS in `backend/src/socket.ts`:
```ts
cors: {
  origin: ['https://admin.yourdomain.com', 'https://team.yourdomain.com'],
  methods: ['GET', 'POST'],
  credentials: true
}
```

Rebuild and restart backend:
```bash
cd /opt/drex_media_os/backend
npm run build
pm2 restart adrex-backend
```

---

## Option 3: Deploy with Docker Compose (Single Server)

### Step 1: Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose (usually included with Docker)
docker compose version
```

### Step 2: Configure docker-compose.yml

The included `docker-compose.yml` is ready. Just update environment variables:

```bash
cd /opt/drex_media_os

# Create .env for compose
nano .env
```

```env
DATABASE_URL=postgresql://adrex:adrexpassword@db:5432/adrex_media
JWT_SECRET=<your-secret>
GROQ_API_KEY=<your-key>
FRONTEND_URL=https://admin.yourdomain.com
NODE_ENV=production
```

### Step 3: Build & Run

```bash
docker compose up -d --build

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f team-portal

# Run Prisma migrations
docker compose exec backend npx prisma migrate deploy
```

### Step 4: Add Nginx + SSL

Same as Option 2 Step 6 & 7, but proxy to Docker ports:

```nginx
# Admin Frontend
server {
    listen 80;
    server_name admin.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Team Portal
server {
    listen 80;
    server_name team.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Option 4: Deploy on AWS

### Backend → AWS Elastic Beanstalk or EC2
1. Create EC2 instance (Ubuntu t2.micro minimum)
2. Follow Option 2 (VPS) steps for backend setup
3. Use RDS for PostgreSQL instead of local Postgres
4. Use ElastiCache for Redis

### Frontend + Team Portal → AWS Amplify or S3 + CloudFront
1. Push code to GitHub
2. Connect AWS Amplify to your repo
3. Set root directory to `frontend` for one app, `team-portal` for another
4. Add `NEXT_PUBLIC_API_URL` env var pointing to backend URL
5. Amplify handles build, deploy, and HTTPS automatically

---

## Post-Deployment Checklist

- [ ] Backend health check: `https://api.yourdomain.com/api/health`
- [ ] Prisma migrations run: `npx prisma migrate deploy`
- [ ] Admin frontend loads: `https://admin.yourdomain.com`
- [ ] Team portal loads: `https://team.yourdomain.com`
- [ ] WebSocket connection works (check browser console)
- [ ] Login/Signup works
- [ ] File uploads work (uploads folder accessible)
- [ ] AI endpoints respond (check GROQ_API_KEY is set)
- [ ] SSL certificates valid
- [ ] PM2 processes running: `pm2 list`
- [ ] Nginx logs clean: `journalctl -u nginx --no-pager`
- [ ] Database backup configured

---

## Quick Commands Reference

```bash
# Check all services
pm2 list
pm2 logs adrex-backend
pm2 logs adrex-admin
pm2 logs adrex-team

# Restart services
pm2 restart adrex-backend
pm2 restart adrex-admin
pm2 restart adrex-team

# Update & redeploy
cd /opt/drex_media_os
git pull
cd backend && npm run build && pm2 restart adrex-backend
cd ../frontend && npm run build && pm2 restart adrex-admin
cd ../team-portal && npm run build && pm2 restart adrex-team

# Docker commands
docker compose up -d --build
docker compose logs -f
docker compose exec backend npx prisma migrate deploy
docker compose down
```
