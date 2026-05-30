# BookFlow

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

A modern booking and invoicing SaaS platform built for freelancers and small businesses. Manage clients, services, bookings, and invoices — all in one place.

## Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **HTTP Client:** Axios

## Features

- [x] User authentication (register, login, logout, token refresh)
- [x] Client management (CRUD with search & pagination)
- [ ] Service management (CRUD with active/inactive toggle)
- [ ] Booking management (CRUD with status tracking)
- [ ] Invoice generation (auto-numbering, line items, tax calculation)
- [ ] Dashboard with stats and revenue charts
- [ ] Print-friendly invoice view
- [ ] Business profile settings
- [ ] Responsive design with collapsible sidebar

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

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
│       ├── controllers/      # Request handlers
│       ├── middlewares/      # Auth, validation, error handling
│       ├── routes/           # API route definitions
│       ├── services/         # Business logic
│       ├── types/            # TypeScript type definitions
│       └── utils/            # JWT, password, API response helpers
├── frontend/                 # React SPA
│   └── src/
│       ├── api/              # Axios HTTP client with interceptors
│       ├── components/       # Reusable UI components
│       ├── contexts/         # React context providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layout components
│       ├── pages/            # Route page components
│       ├── services/         # API service functions
│       └── types/            # TypeScript interfaces
└── .github/workflows/        # CI/CD pipelines
```

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

## License

MIT
