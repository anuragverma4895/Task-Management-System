# TaskFlow Architecture

## Repository layout
- `frontend/`: React/Vite application and Axios API client.
- `backend/`: Express API, authentication middleware/controllers, Mongoose models, validation and logging.
- Root `.env`: local-only configuration, ignored by Git.
- Root `.env.example`: safe variable template.
- `docs/`: architecture and API notes.

## Request flow
1. The React app checks `GET /api/auth/me` on startup.
2. If no session exists, the user can create an account or sign in.
3. The backend hashes passwords with bcrypt and creates a random opaque session token. Only a SHA-256 token hash is stored in MongoDB.
4. The browser stores the session in an HTTP-only, SameSite=Lax cookie; frontend requests include credentials.
5. Express applies security headers, CORS, request parsing, HTTP logging, and rate limiting.
6. Protected API routes validate the session and derive the user ID from the session, never from request-body ownership fields.
7. Task reads, updates, and deletes are scoped to the authenticated user's creator ID.

## Configuration
Backend configuration discovers the root `.env` and validates runtime values. Vite reads public `VITE_*` values; secrets must remain backend-only. Hosting providers do not inherit local environment files automatically.

## Current security boundaries
- Passwords are never stored in plaintext.
- Session tokens are random; their hashes are stored in MongoDB and expire after seven days.
- Authentication endpoints are rate-limited.
- Task records are filtered by authenticated creator for every operation.
- Production must use HTTPS, a strong unique server secret, and the exact frontend origin in CORS.

## MVP scope and remaining work
Working now: signup, login, current-user lookup, logout, persistent per-user task CRUD, search/filter, status/priority/due date fields, and CSV export.

Not implemented yet: shared workspaces, invitation/role management, projects CRUD, calendar UI, activity history, email verification/password recovery, attachments, reminders, notification delivery, and authenticated Socket.IO collaboration. Do not treat these as production features until implemented and tested.
