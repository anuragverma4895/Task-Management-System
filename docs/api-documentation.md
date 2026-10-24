# TaskFlow API Notes

Local base URL: `http://localhost:5000/api`.

## Available endpoint
### GET /health
Returns service status and timestamp at `/api/health`.

## Planned task API
The task controller and route module define these paths but are not mounted into the public API router in this foundation commit. Requests currently receive a generic 501 response until integration is completed.

| Method | Path | Purpose |
|---|---|---|
| GET | `/tasks` | List owned tasks with pagination, search, filters, and sorting |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get an owned task |
| PATCH | `/tasks/:id` | Update an owned task |
| DELETE | `/tasks/:id` | Delete an owned task |

## Query parameters
- `page`: integer, default 1.
- `limit`: integer 1–100, default 20.
- `q`: search text in title, description, labels.
- `status`: `backlog`, `todo`, `in_progress`, `in_review`, `completed`, `cancelled`.
- `priority`: `low`, `medium`, `high`, `urgent`.
- `archived`: `true` or `false`, default false.
- `sort`: `title`, `createdAt`, `updatedAt`, `dueDate`, `priority`, or `status`.
- `order`: `asc` or `desc`.

List responses use `{ data, page, limit, total, pages }`; single task responses use `{ data }`. Validation errors use HTTP 400. Requests without an authenticated identity return HTTP 401.

Never let the browser provide ownership fields. The server must derive ownership from an authenticated session. Add OpenAPI/Swagger after routes and authentication are connected.
