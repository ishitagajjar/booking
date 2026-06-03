# BookFlow

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Claude API](https://img.shields.io/badge/Claude%20API-Anthropic-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

AI-powered booking and invoicing SaaS platform built for freelancers and small businesses. Manage clients, services, bookings, and invoices — with intelligent AI features powered by Claude.

## Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod
- **AI:** Claude API (Anthropic) — tool use, structured output, streaming

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **HTTP Client:** Axios

## Features

### Core
- [x] User authentication (register, login, logout, token refresh)
- [x] Client management (CRUD with search & pagination)
- [x] Service management (CRUD with active/inactive toggle)
- [x] Booking management (CRUD with status tracking)
- [x] Invoice generation (auto-numbering, line items, tax calculation)
- [x] Dashboard with stats and revenue charts
- [x] Print-friendly invoice view
- [x] PDF invoice export
- [x] Business profile settings
- [x] Responsive design with collapsible sidebar
- [x] Booking calendar view
- [x] Status filtering on bookings & invoices

### AI-Powered Features
- [x] AI invoice description generator — auto-drafts professional line items from booking data
- [x] Client insights & analytics — AI analyzes booking history, identifies patterns, suggests actions
- [x] Follow-up email drafter — generates professional emails for overdue invoices and booking follow-ups
- [x] Natural language search — search bookings, clients, invoices using plain English ("show overdue invoices over $500")
- [x] Smart pricing suggestions — AI analyzes historical data to recommend optimal service pricing
- [x] AI chat assistant — conversational bot with tool use that queries real business data

## AI Features

### AI Invoice Description Generator
Auto-generates professional invoice line items from booking details. Uses Claude API with structured prompting to produce concise, context-aware descriptions.

### Client Insights & Analytics
Analyzes a client's booking history, spending patterns, and engagement to surface actionable insights. Claude returns structured JSON with summary, patterns, suggestions, risk level, and lifetime value.

### Follow-Up Email Drafter
Generates ready-to-send emails for overdue invoice reminders, post-booking follow-ups, and upcoming appointment reminders. Returns editable subject + body with professional tone.

### Natural Language Search
Converts plain English queries into structured database searches across bookings, clients, invoices, and services. Claude parses the query into filters, entity type, and sort order, then Prisma executes the query.

### Smart Pricing Suggestions
Analyzes historical booking data, revenue trends, and category comparisons to suggest optimal pricing. Returns suggested price, confidence level, price range, reasoning, and insights.

### AI Chat Assistant
A floating chat widget available on every page. Uses Claude's tool use (function calling) to query real business data — dashboard stats, client search, upcoming bookings, and overdue invoices — then responds conversationally.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+
- Anthropic API key (for AI features)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd BookFlow
   ```

2. **Install all dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials and secrets
   ```

   **Backend environment variables:**

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `ACCESS_TOKEN_SECRET` | JWT access token secret |
   | `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
   | `PORT` | Server port (default: 3000) |
   | `NODE_ENV` | Environment (development/production) |
   | `CLAUDE_API_KEY` | Anthropic API key for AI features |
   | `CLAUDE_MODEL` | Claude model ID (default: claude-sonnet-4-20250514) |

4. **Run database migrations**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:generate
   ```

5. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   - Backend API: http://localhost:3000
   - Frontend: http://localhost:5173

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run backend` | Start backend only |
| `npm run frontend` | Start frontend only |
| `npm run setup` | Install all dependencies |

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled code |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |

## Architecture

```
BookFlow/
├── backend/                  # Express API server
│   ├── prisma/               # Database schema & migrations
│   └── src/
│       ├── config/           # Environment configuration
│       ├── controllers/      # Request handlers (incl. ai.controller.ts)
│       ├── middlewares/      # Auth, validation, error handling
│       ├── routes/           # API route definitions (incl. ai.routes.ts)
│       ├── services/         # Business logic + AI services
│       │   ├── ai.service.ts         # Base Claude client (askClaude, streamClaude)
│       │   ├── ai-invoice.service.ts # Invoice description generator
│       │   ├── ai-client.service.ts  # Client insights & analytics
│       │   ├── ai-email.service.ts   # Follow-up email drafter
│       │   ├── ai-search.service.ts  # Natural language search
│       │   ├── ai-pricing.service.ts # Smart pricing suggestions
│       │   └── ai-chat.service.ts    # Chat with tool use
│       ├── types/            # TypeScript type definitions
│       └── utils/            # JWT, password, API response, PDF generator
├── frontend/                 # React SPA
│   └── src/
│       ├── api/              # Axios HTTP client with interceptors
│       ├── components/
│       │   ├── ui/           # Reusable UI primitives
│       │   └── ai/           # AI-powered components
│       │       ├── AIDescriptionButton.tsx
│       │       ├── ClientInsights.tsx
│       │       ├── AIEmailDrafter.tsx
│       │       ├── AISearchBar.tsx
│       │       ├── PricingSuggestion.tsx
│       │       └── AIChatWidget.tsx
│       ├── contexts/         # React context providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layout components
│       ├── pages/            # Route page components
│       ├── services/         # API service functions (incl. aiService.ts)
│       └── types/            # TypeScript interfaces
└── .github/workflows/        # CI/CD pipelines
```

### AI Architecture

```
Frontend Components          Backend API              Claude API
─────────────────           ───────────              ──────────
AISearchBar       ──POST──▶ /api/ai/search     ──▶  Structured output (JSON)
ClientInsights    ──POST──▶ /api/ai/client-summary   Structured output (JSON)
AIDescriptionBtn  ──POST──▶ /api/ai/invoice-desc     Text generation
AIEmailDrafter    ──POST──▶ /api/ai/follow-up-email  Structured output (JSON)
PricingSuggestion ──POST──▶ /api/ai/suggest-pricing  Structured output (JSON)
AIChatWidget      ──POST──▶ /api/ai/chat       ──▶  Tool use (function calling)
                                                      ├─ get_dashboard_stats
                                                      ├─ search_clients
                                                      ├─ get_upcoming_bookings
                                                      └─ get_overdue_invoices
```

- All `/api/ai/*` endpoints are protected by JWT auth middleware
- All database queries are scoped to the authenticated user (multi-tenant)
- AI services use `@anthropic-ai/sdk` to communicate with Claude
- Chat assistant uses Claude tool use to query Prisma/PostgreSQL in real-time

### API Response Format

All API endpoints return a consistent response format:

```json
{
  "IsSuccess": true,
  "Data": { ... },
  "Message": "Success"
}
```

## Screenshots

> Screenshots coming soon

- Dashboard with AI search bar
- Client insights card
- AI chat widget
- Invoice description generator
- Email drafter modal

## License

MIT
