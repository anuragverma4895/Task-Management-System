# TaskFlow — Personal Task Management

TaskFlow is a full-stack task manager. Every person can create an account, sign in from any browser, and manage a private task list. User accounts and tasks are stored in MongoDB; each task API request is scoped to the signed-in user's ID on the server.

## What works in this version
- Account creation and sign-in with email and password.
- Password hashing with bcrypt and server-side, opaque sessions stored as token hashes.
- HTTP-only session cookie, logout, and rate-limited authentication endpoints.
- Per-user task creation, listing, search/filter, status/priority/due-date display, status updates, deletion, and CSV export.
- Responsive dashboard, light/dark appearance toggle, and task metrics calculated from saved tasks.
- Separate React/Vite frontend and Express/Mongoose backend.

## Current limitations
This is a working MVP foundation, not a finished collaboration suite. Shared workspaces, invitations/roles, project CRUD, calendar view, activity history, email verification/password reset, file attachments, reminders, and real-time collaboration are not implemented yet. Notification UI is informational only. Do not present these as available features.

## Tech stack
- **Frontend:** React, Vite, TypeScript, TanStack Query, Axios, Lucide.
- **Backend:** Node.js 20+, Express, TypeScript, MongoDB/Mongoose, bcryptjs, Zod, Helmet, rate limiting.
- **Session security:** random opaque session token; only its SHA-256 hash is stored in MongoDB; cookie is HTTP-only and SameSite=Lax.

## Folder structure
```text
.
├── frontend/       # React application
├── backend/        # Express API, authentication, task endpoints and models
├── docs/           # Architecture and API notes
├── .env.example    # Safe local configuration template
├── .env            # Your local secrets/config; never commit this
└── package.json    # npm workspace commands
```

## Run locally (Windows PowerShell)

1. Install Node.js 20 or newer.
2. Install dependencies from the repository root:
   ```powershell
   npm install
   ```
3. Create your local environment file:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Set `MONGODB_URI` in the root `.env` to a reachable MongoDB database. You can use a local MongoDB server or MongoDB Atlas. The default URI assumes MongoDB is installed and running on your PC.
5. Start the frontend and backend:
   ```powershell
   npm run dev
   ```
6. Open **http://localhost:5173** and create an account. The backend health endpoint is **http://localhost:5000/api/health**.

### MongoDB Atlas
Create a database and database user in Atlas, allow network access only from the IPs you need, and copy the connection URI into `MONGODB_URI`. Replace the username/password placeholders in the URI and URL-encode special characters in credentials. Never expose the database URI in a `VITE_*` variable or commit it to Git.

### Environment variables
- `PORT`: backend port (default 5000).
- `FRONTEND_URL`: exact frontend origin allowed by CORS (local default 5173).
- `VITE_API_URL`: frontend API base URL.
- `MONGODB_URI`: backend-only MongoDB connection string.
- `COOKIE_SECRET`, `JWT_SECRET`: server environment secrets; use strong, unique values in production. Current browser sessions are opaque database-backed sessions, not JWTs.
- `NODE_ENV=production`: enables secure session cookies; production must use HTTPS.

## Commands
```bash
npm run dev
npm run build
npm run typecheck
npm run test
npm run lint
```

Run build, typecheck and tests before deploying. This repository change has not been executed in your local environment by GitHub's file editor; please run those checks locally and share any error output so it can be fixed.

## Deployment
Deploy the frontend and backend separately or configure a single host to serve both. Set the backend's `MONGODB_URI`, a strong `COOKIE_SECRET`, `FRONTEND_URL`, and `NODE_ENV=production` in the hosting provider. Set `VITE_API_URL` to the deployed API URL at frontend build time. Use HTTPS and an exact CORS origin. Never upload your local `.env`.

## Design
Light, responsive dashboard; high-contrast bold Times New Roman typography; status and priority indicators; search, filters, CSV export, and an optional dark appearance.

## Documentation
- [Architecture](docs/architecture.md)
- [API documentation](docs/api-documentation.md)
