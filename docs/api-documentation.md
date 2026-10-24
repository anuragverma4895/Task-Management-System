# TaskFlow API Documentation

Local API base URL: `http://localhost:5000/api`.

Authentication uses an HTTP-only `taskflow_session` cookie. Send requests with credentials enabled; the frontend Axios client already does this. Task routes require a valid session and return only tasks owned by the signed-in user.

## Health
| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | API status and timestamp; no login required |

## Authentication
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/signup` | Create an account and start a session |
| POST | `/auth/login` | Verify credentials and start a session |
| GET | `/auth/me` | Return the current signed-in user |
| POST | `/auth/logout` | Revoke the current session and clear the cookie |

Signup body:
```json
{ "name": "Alex Morgan", "email": "alex@example.com", "password": "at-least-8-characters" }
```

Login body:
```json
{ "email": "alex@example.com", "password": "your-password" }
```

Passwords are hashed with bcrypt before storage. Session tokens are random and only their SHA-256 hashes are stored in the database. Authentication endpoints are rate limited. Use HTTPS in production.

## Tasks (authentication required)
| Method | Path | Purpose |
|---|---|---|
| GET | `/tasks` | List the current user's tasks |
| POST | `/tasks` | Create a task owned by the current user |
| GET | `/tasks/:id` | Get one owned task |
| PATCH | `/tasks/:id` | Update an owned task |
| DELETE | `/tasks/:id` | Delete an owned task |
| GET | `/activity` | List the signed-in user's recent task activity |

Create task body:
```json
{
  "title": "Prepare weekly plan",
  "description": "",
  "status": "todo",
  "priority": "medium",
  "dueDate": null,
  "labels": []
}
```

### Query parameters
- `page`: integer, default 1.
- `limit`: integer 1–100, default 20.
- `q`: search in title, description and labels.
- `status`: `backlog`, `todo`, `in_progress`, `in_review`, `completed`, `cancelled`.
- `priority`: `low`, `medium`, `high`, `urgent`.
- `archived`: `true` or `false`, default false.
- `sort`: `title`, `createdAt`, `updatedAt`, `dueDate`, `priority`, or `status`.
- `order`: `asc` or `desc`.

List responses use `{ data, page, limit, total, pages }`; single-task responses use `{ data }`. Validation errors return HTTP 400; unauthenticated requests return HTTP 401. The server derives ownership from the session; clients must not submit ownership fields.

## Not implemented yet
Workspace membership/roles, projects CRUD, notifications, file uploads, scheduled reminders, email verification/password recovery, and real-time collaboration are future work. The calendar agenda is derived from task due dates in the frontend.
