# TaskFlow Architecture

## Repository layout
- `frontend/`: React, Vite, TypeScript, visual components and API client.
- `backend/`: Express API, Mongoose models, validation, configuration and logging.
- Root `.env`: local-only config, ignored by Git.
- Root `.env.example`: safe names and placeholders.
- `docs/`: architecture and API notes.

## Request flow
1. Browser renders the React application.
2. Frontend requests use Axios and `VITE_API_URL`.
3. Express applies security headers, configured CORS, body parsing, HTTP logging, and auth-prefix rate limiting.
4. Zod schemas validate task inputs and query parameters.
5. Mongoose models describe task ownership and indexed query paths.
6. Socket events should be emitted only after persisted operations and after socket authentication/room authorization are complete.

## Configuration
Vite `envDir` points to the repository root. Only `VITE_*` values belong in frontend code. Backend configuration discovers root `.env` by module path and validates runtime values. Hosting providers do not inherit this file automatically; configure environment variables in their dashboards.

## Ownership and authorization
Task records store creator and optional assignee/workspace/project references. Task controller methods return 401 unless a validated user identity is injected, and scope reads/writes/deletes to the creator. Authentication middleware, project/workspace role rules, and collaborative access must be implemented and wired before treating this as a production API.

## Foundation limitations
The dashboard currently uses local preview data and is not wired to the API. Auth and generic API routes intentionally return 501. Socket connections are rejected while authentication and room authorization are unavailable. This avoids presenting preview behavior as persistent or collaborative functionality.
