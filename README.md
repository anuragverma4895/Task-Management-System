# TaskFlow — Full-Stack Task Management

TaskFlow is a full-stack task management and productivity platform organized as a TypeScript monorepo with separate `frontend/` and `backend/` apps and shared root environment configuration.

> **Implementation status:** This foundation includes monorepo configuration, a responsive dashboard preview, API server scaffold, environment handling, and documentation. It is not yet a complete production application. Review the verification commands and known limitations before deploying.

## Goals
- Manage tasks by status, priority, due date, project, and labels.
- Provide a responsive task overview and productivity metrics.
- Separate React UI from Express APIs.
- Use MongoDB for persisted data and Socket.IO for authorized real-time collaboration as these modules are completed.
- Keep server secrets in root `.env`; expose only public `VITE_*` values to the browser.

## Stack
- **Frontend:** React, Vite, TypeScript, React Router, TanStack Query, Axios, Lucide, Socket.IO Client.
- **Backend:** Node.js, Express, TypeScript, MongoDB/Mongoose, Socket.IO, Zod, Helmet, rate limiting.
- **Quality:** TypeScript checks, lint/test scaffolding.

## Structure
```text
.
├── frontend/       # React + Vite application
├── backend/        # Express REST API and server
├── docs/           # Architecture and API notes
├── .env            # Local-only environment; ignored by Git
├── .env.example    # Safe variable template
├── package.json    # npm workspace scripts
└── README.md
```

## Prerequisites
- Node.js 20+ and npm.
- MongoDB local instance or MongoDB Atlas URI for database-backed flows.
- Optional SMTP provider for email delivery.

## Local setup
1. Clone this repository and enter the root directory.
2. Install: `npm install`.
3. Configure the root `.env` using `.env.example` as a reference.
4. Start both apps: `npm run dev`.
5. Frontend: http://localhost:5173. Backend health endpoint: http://localhost:5000/api/health.

## Environment
The backend resolves the root `.env` independently of the working directory. Vite reads from the repository root; only variables beginning with `VITE_` are exposed to client code. Never put secrets in a `VITE_` variable.

Production hosts do not automatically inherit the local root `.env`:
- **Render:** set backend environment variables in the service dashboard and configure `FRONTEND_URL`.
- **Vercel:** set only necessary public values such as `VITE_API_URL`.
- **MongoDB Atlas:** create a least-privilege database user, restrict network access, and set `MONGODB_URI` on the backend only.

## Scripts
```bash
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck
```

## Design
The dashboard uses a light background, near-black bold Times New Roman typography, clear task status/priority indicators, responsive navigation, and a dark theme toggle.

## Documentation
- [Architecture](docs/architecture.md)
- [API documentation](docs/api-documentation.md)

## Screenshots
Add genuine screenshots after running the app locally. Do not use placeholder screenshots to imply working functionality.

## Security and verification
Never commit `.env`, production data, credentials, or private uploads. Keep authorization checks on the server, use HTTPS and secure cookies in production, and restrict CORS to the intended frontend origin.

A GitHub commit alone does not prove dependencies install, tests pass, or deployment works. Run the scripts above and record their actual results before describing the project as production-ready.
