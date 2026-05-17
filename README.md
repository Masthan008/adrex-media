# Adrex Media OS

> All-in-one agency management platform for campaigns, clients, influencers, finance, and team collaboration — powered by AI.

![Adrex Media](frontend/public/logo.png)

---

## 🚀 Features

### 📊 Dashboard
- Real-time KPIs: revenue, campaigns, clients, tasks
- Monthly revenue chart & activity feed
- Quick stats at a glance

### 📢 Campaign Management
- Create, edit, and delete campaigns with budget tracking
- AI-generated campaign briefs, content captions, and outreach emails
- Assign influencers and team members to campaigns

### 👥 Client & Influencer CRM
- Full client database with contact info and monthly budgets
- Influencer profiles with platform links, niche, and ratings
- WhatsApp integration for quick outreach

### 💰 Finance & Invoicing
- Track expenses by category
- Generate professional PDF invoices
- Revenue and profit margin analytics

### 📅 Calendar & Tasks
- Visual calendar for scheduling campaigns and deadlines
- Kanban-style task board with drag-and-drop
- Task assignments and status tracking

### 🤖 AI Tools
- Campaign brief generator
- Social media caption writer
- Outreach email composer
- Strategy planner
- Interactive AI chat assistant with history

### 💬 Team Collaboration
- Real-time team chat via WebSocket
- 1:1 private messaging with persistent history
- AI assistant built into chat

### 📄 Reports & Exports
- Comprehensive PDF reports with KPIs, campaigns, clients, and finances
- Itemized invoice PDFs with branding

### 📁 File Management
- Upload, search, filter, and delete files
- Category-based organization

### 🔔 Notifications
- Real-time notification center
- Mark as read / mark all as read
- Notification preferences

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Admin Frontend    │     │    Team Portal      │
│   Next.js :3000     │     │    Next.js :3001    │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └───────────┬───────────────┘
                       │ REST + WebSocket
               ┌───────▼────────┐
               │   Backend API  │
               │  Express :5000 │
               └───────┬────────┘
                       │
              ┌────────▼─────────┐
              │   PostgreSQL     │
              │   (Prisma ORM)   │
              └──────────────────┘
```

### Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14, React, Tailwind CSS, Framer Motion, Zustand |
| Backend     | Node.js, Express, TypeScript, Prisma ORM |
| Database    | PostgreSQL                          |
| Real-time   | Socket.IO                           |
| AI          | Groq API (Llama, Mixtral models)    |
| Auth        | JWT + bcrypt                        |
| PDF         | PDFKit                              |
| Email       | Nodemailer                          |
| Validation  | Zod                                 |
| Deployment  | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
adrex-media-os/
├── backend/           # Express + Prisma API server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Auth, validation, error handling
│   │   ├── services/      # Business logic (AI, email, WhatsApp)
│   │   ├── socket.ts      # WebSocket setup
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── uploads/           # File upload storage
├── frontend/          # Admin dashboard (Next.js)
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── store/         # Zustand stores (auth, socket)
│   │   └── lib/           # Utilities and API client
│   └── public/        # Static assets (logo, etc.)
├── team-portal/       # Team member portal (Next.js)
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # UI components
│   │   └── store/         # Zustand stores
│   └── public/        # Static assets
├── shared/            # Shared Zod schemas and types
├── docker-compose.yml # Local development setup
├── render.yaml        # Render Blueprint deploy config
└── netlify.toml       # Netlify deploy config
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- **PostgreSQL 15+**
- **Groq API key** ([console.groq.com](https://console.groq.com))

### 1. Clone the Repository

```bash
git clone https://github.com/shaikmeharaj1507-commits/adrex-media.git
cd adrex-media
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env   # or create manually
```

**Required `.env` variables:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/adrex_media
JWT_SECRET=your-super-secret-key
GROQ_API_KEY=your-groq-api-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

**Optional:**

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### 3. Setup Admin Frontend

```bash
cd frontend
npm install --legacy-peer-deps

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

npm run dev
```

### 4. Setup Team Portal

```bash
cd team-portal
npm install --legacy-peer-deps

echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

npm run dev
```

### 5. Access the App

| Service       | URL                           |
|---------------|-------------------------------|
| Admin Dashboard | http://localhost:3000       |
| Team Portal     | http://localhost:3001       |
| Backend API     | http://localhost:5000       |
| API Health      | http://localhost:5000/api/health |

---

## 🐳 Docker Setup

```bash
# Build and start all services
docker compose up -d --build

# Run Prisma migrations
docker compose exec backend npx prisma migrate deploy

# View logs
docker compose logs -f backend

# Stop all services
docker compose down
```

---

## ☁️ Deployment

### Quick Deploy (Recommended)

**Backend → Render** | **Frontends → Vercel**

1. Fork this repo to your GitHub
2. Deploy backend on Render using `render.yaml` Blueprint
3. Deploy `frontend/` on Vercel (set root directory to `frontend`)
4. Deploy `team-portal/` on Vercel (set root directory to `team-portal`)
5. Update CORS origins in backend with your Vercel URLs

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions including:
- Vercel + Render (one-click)
- Vercel + Railway
- Single VPS with Nginx + SSL
- Docker Compose
- AWS (Elastic Beanstalk + Amplify)

---

## 📡 API Endpoints

### Auth
| Method | Path              | Description        |
|--------|-------------------|--------------------|
| POST   | `/api/auth/signup`| Create new agency  |
| POST   | `/api/auth/login` | Sign in            |
| POST   | `/api/auth/logout`| Sign out           |

### Campaigns
| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/campaigns`        | List all campaigns       |
| POST   | `/api/campaigns`        | Create campaign          |
| GET    | `/api/campaigns/:id`    | Get campaign details     |
| PUT    | `/api/campaigns/:id`    | Update campaign          |
| DELETE | `/api/campaigns/:id`    | Delete campaign          |

### AI
| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| POST   | `/api/ai/chat`    | AI chat assistant        |
| POST   | `/api/ai/brief`   | Generate campaign brief  |
| POST   | `/api/ai/caption` | Generate social caption  |
| POST   | `/api/ai/outreach`| Generate outreach email  |
| POST   | `/api/ai/strategy`| Generate strategy plan   |
| GET    | `/api/ai/history` | Get chat history         |

### Messages
| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/messages/conversations`| List conversations       |
| GET    | `/api/messages/:userId`     | Get 1:1 messages         |
| POST   | `/api/messages`             | Send message             |
| PUT    | `/api/messages/:id/read`    | Mark as read             |

### PDF
| Method | Path                              | Description          |
|--------|-----------------------------------|----------------------|
| GET    | `/api/pdf/invoice/:id`            | Download invoice PDF |
| GET    | `/api/pdf/report`                 | Download report PDF  |

### Finance
| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/finance/invoices`     | List invoices            |
| POST   | `/api/finance/invoices`     | Create invoice           |
| GET    | `/api/finance/expenses`     | List expenses            |
| POST   | `/api/finance/expenses`     | Create expense           |
| PUT    | `/api/finance/expenses/:id` | Update expense           |

---

## 🗄️ Database Schema

Key models: `User`, `Agency`, `Client`, `Campaign`, `Influencer`, `Task`, `Expense`, `Invoice`, `Message`, `CalendarEvent`, `File`, `Notification`, `AIChat`

View full schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

---

## 🔐 Security

- JWT authentication with httpOnly cookies
- Zod input validation on all endpoints
- CORS restricted to allowed origins
- Helmet.js security headers
- Rate limiting on auth endpoints
- Password hashing with bcrypt (salt rounds: 10)

---

## 📝 Environment Variables

| Variable              | Purpose                  | Required |
|-----------------------|--------------------------|----------|
| `DATABASE_URL`        | PostgreSQL connection    | Yes      |
| `JWT_SECRET`          | Auth token signing       | Yes      |
| `GROQ_API_KEY`        | AI generation            | Yes      |
| `FRONTEND_URL`        | CORS origin (admin)      | Yes      |
| `TEAM_PORTAL_URL`     | CORS origin (team)       | Yes      |
| `TWILIO_ACCOUNT_SID`  | WhatsApp messaging       | No       |
| `TWILIO_AUTH_TOKEN`   | WhatsApp messaging       | No       |
| `SMTP_HOST` / `PORT`  | Email sending            | No       |
| `SMTP_USER` / `PASS`  | Email sending            | No       |

---

## 🗺️ Roadmap

### Phase 1 — Quick Wins ✅
- File delete, client delete, WhatsApp phone fix
- Zod validation, skeleton loaders
- Collapsible sidebar, user menu

### Phase 2 — Core Fixes ✅
- Campaign edit, file search/filter, calendar edit
- Notification center, avatar upload, agency logo
- Email verification

### Phase 3 — Feature Additions (In Progress)
- Campaign assignments, activity log
- Task assignments, team activity feed
- AI content review, AI chat history
- Light/dark mode toggle

### Phase 4 — Major Features
- Campaign performance tracking
- Content calendar, client portal
- AI influencer matching
- Stripe subscription billing

### Phase 5 — Advanced
- Contract management, approval workflow
- Revenue dashboard, social media API
- PWA support, geographic map

See [PLAN.md](PLAN.md) for the full roadmap.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software for Adrex Media.

---

## 📬 Support

For issues, feature requests, or questions, please open an issue on [GitHub](https://github.com/shaikmeharaj1507-commits/adrex-media/issues).
