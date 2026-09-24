# Team Project Management API

A REST API for organizing team projects and their tasks. It supports project and task CRUD operations, project membership, task assignment, validation, consistent errors, and PostgreSQL persistence.

This project is the backend technical task for Cairo University Racing Team, season 2026-2027.

## Technologies

- Node.js and Express 5
- PostgreSQL
- Prisma ORM 7
- Zod validation
- bcrypt password hashing
- JWT access tokens and opaque refresh tokens
- Nodemailer verification emails
- Express rate limiting
- JavaScript ES modules

## Current scope

The current implementation completes the Level 1 API requirements:

- PostgreSQL database and Prisma models
- User, Profile, Project, ProjectMember, and Task models
- Project CRUD
- Task CRUD, including status and priority
- Request-body and URL-parameter validation
- Consistent success and error responses
- Routes, controllers, services, repositories, validation, and middleware separated by responsibility
- Repeatable sample-data seed

It also implements the Level 2 authentication and data-integrity foundation:

- Registration with bcrypt password hashing
- Email verification and resend flow
- Login with generic credential errors
- Short-lived JWT access tokens
- Database-backed sessions
- Hashed, rotating refresh tokens stored in `httpOnly` cookies
- Refresh-token reuse detection and session revocation
- Logout, logout-all, and current-user endpoints
- Protected project and task routes
- Authentication rate limits
- Project access, owner-only mutations, and valid task-assignee checks

## Requirements

- Node.js 22.18 or later, below Node.js 25
- npm
- PostgreSQL

## Local setup

1. Clone the repository and enter its directory.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.

   On PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Create an empty PostgreSQL database and configure `.env`:

   ```env
   HOST=localhost
   PORT=3000
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/team_project_management"
   FRONTEND_URL="http://localhost:5173"
   ACCESS_TOKEN_SECRET="your-generated-base64url-secret"
   ```

   Generate a secure access-token secret with:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   `EMAIL_USER` and `EMAIL_APP_PASSWORD` are optional locally and required in production. Without them, development signup returns a verification URL and prints it to the server console.

5. Apply the committed migrations:

   ```bash
   npm run db:deploy
   ```

6. Insert the sample data:

   ```bash
   npm run db:seed
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

The API is available at `http://localhost:3000` by default.

## Seeded login

All six seeded accounts are verified and use this development-only password:

```text
Password123!
```

For example, log in with `level1@example.com`. The two real email addresses used for the recorded signup demonstration are intentionally not seeded. Send the returned access token on protected requests:

```text
Authorization: Bearer <access-token>
```

The refresh token is not returned in JSON. It is stored in an `httpOnly` cookie and sent to the refresh/logout endpoints by clients that include credentials.

The ready-to-run requests in `api.rest` test authentication plus complete Project and Task CRUD. Run them from top to bottom with the VS Code REST Client extension because later requests reuse IDs, tokens, and cookies created by earlier requests.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and restart it when source files change |
| `npm start` | Start the API normally |
| `npm run build` | Generate the Prisma client |
| `npm run prisma:validate` | Validate the Prisma schema and configuration |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create and apply a migration during development |
| `npm run db:deploy` | Apply existing migrations in deployment or a clean environment |
| `npm run db:seed` | Insert or refresh the sample records |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run the automated authentication contract tests |

The seed is safe to rerun because it uses fixed IDs and `upsert`. It inserts 6 users, 6 profiles, 4 projects, 10 project memberships, and 20 tasks without deleting unrelated records.

## API conventions

Base URL:

```text
http://localhost:3000/api
```

Successful requests that return content use this structure:

```json
{
  "data": {}
}
```

Validation and application errors use this structure:

```json
{
  "error": "Validation failed.",
  "code": "INVALID_SCHEMA",
  "details": [
    {
      "field": "title",
      "message": "Too small: expected string to have >=1 characters"
    }
  ]
}
```

Delete endpoints return `204 No Content` after a successful deletion.

## Authentication endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an unverified account and profile |
| `POST` | `/api/auth/verify-email` | Verify an account using the emailed token |
| `POST` | `/api/auth/resend-verification` | Replace and resend a verification token |
| `POST` | `/api/auth/login` | Create a session, set the refresh cookie, and return an access token |
| `POST` | `/api/auth/refresh` | Rotate the refresh token and return a new access token |
| `POST` | `/api/auth/logout` | Revoke the current session and clear the cookie |
| `POST` | `/api/auth/logout-all` | Revoke all sessions for the account and clear the cookie |
| `GET` | `/api/auth/me` | Return the authenticated user |

### How authentication works

1. Signup creates the user with a bcrypt password hash and sends an email-verification link.
2. The user verifies the account with the token from that link.
3. Login returns a short-lived access token and sets a longer-lived refresh token as an `httpOnly` cookie.
4. Protected endpoints receive the access token through `Authorization: Bearer <access-token>`.
5. When the access token expires, `/api/auth/refresh` checks the cookie, replaces the old refresh token, and returns a new access token. The user does not need to log in again.
6. Logout revokes the current session. Logout-all revokes every session belonging to the user.

The raw refresh token is never stored in the database. Only its SHA-256 hash is stored. Every successful refresh consumes the old token and creates a new one. Reusing an old token outside the short race-condition grace period revokes the session.

Signup body:

```json
{
  "email": "driver@example.com",
  "name": "Race Driver",
  "password": "Password123!"
}
```

Login body:

```json
{
  "email": "driver@example.com",
  "password": "Password123!"
}
```

Verify-email body:

```json
{
  "token": "64-character-token-from-the-verification-link"
}
```

Resend-verification body:

```json
{
  "email": "driver@example.com"
}
```

Login and refresh responses return the access token inside `data.accessToken`. Access tokens expire after 15 minutes by default. Refresh tokens expire after 7 days and cannot outlive their 30-day session.

Browser clients must allow cookies when calling login, refresh, logout, or logout-all. For example:

```js
fetch("http://localhost:3000/api/auth/refresh", {
  method: "POST",
  credentials: "include",
});
```

## Project endpoints

| Method | Endpoint | Description | Access rule |
| --- | --- | --- | --- |
| `POST` | `/api/projects` | Create a project | Authenticated user |
| `GET` | `/api/projects` | List projects owned by or joined by the user | Owner or member |
| `GET` | `/api/projects/:projectId` | Get one project | Owner or member |
| `PATCH` | `/api/projects/:projectId` | Update a project | Owner only |
| `DELETE` | `/api/projects/:projectId` | Delete a project and its tasks/members | Owner only |

Create-project body:

```json
{
  "name": "Race Car Development",
  "description": "Coordinate design, manufacturing, and testing."
}
```

`name` is required. `description` is optional and can be `null`.

## Task endpoints

| Method | Endpoint | Description | Access rule |
| --- | --- | --- | --- |
| `POST` | `/api/projects/:projectId/tasks` | Create a task in a project | Owner or member |
| `GET` | `/api/projects/:projectId/tasks` | List tasks in one project | Owner or member |
| `GET` | `/api/projects/:projectId/tasks/:taskId` | Get one task | Owner or member |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId` | Update a task | Owner only |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | Delete a task | Owner only |
| `GET` | `/api/tasks` | List all tasks assigned to the current user across projects | Authenticated user |

Create-task body:

```json
{
  "title": "Validate telemetry packets",
  "description": "Check packet decoding against sample ECU data.",
  "status": "TODO",
  "priority": "HIGH",
  "assignedToId": "00000000-0000-4000-8000-000000000001"
}
```

`title`, `description`, `status`, and `priority` are required during creation. `assignedToId` is optional and can be `null`. A non-null assignee must be the project owner or one of its members.

Accepted task values:

- Status: `TODO`, `IN_PROGRESS`, `DONE`
- Priority: `LOW`, `MEDIUM`, `HIGH`

PATCH requests accept any non-empty subset of the corresponding create fields.

## Database design

The main relationships are:

```text
User 1 --- 0..1 Profile
User 1 --- many AuthSession
AuthSession 1 --- many RefreshToken
User 1 --- many Project (owner)
User many --- many Project (through ProjectMember)
Project 1 --- many Task
User 1 --- many Task (optional assignee)
```

Important integrity rules:

- User email addresses are unique.
- Passwords are stored only as bcrypt hashes.
- Verification and refresh tokens are stored only as SHA-256 hashes.
- Deleting a user cascades to their sessions and refresh tokens.
- A user can appear only once in a project's membership list.
- Deleting a project cascades to its tasks and memberships.
- Deleting a user sets their task assignments to `null`.
- Foreign-key and frequently queried fields have database indexes.

## Project structure

```text
prisma/
  migrations/          Database migrations
  seed-data/           Separate seed files for each model/group
  schema.prisma        Database schema
  seed.js              Seed entry point
src/
  config/              Validated environment configuration
  emails/              Verification email delivery
  lib/                 Shared Prisma client
  middlewares/         Authentication, validation, and errors
  modules/
    auth/              Auth routes, tokens, service, and session repositories
    projects/          Project routes, controller, service, repository, validation
    tasks/             Task routes, controller, service, repository, validation
    users/             User persistence
  app.js               Express application and route registration
  index.js             Database connection and server entry point
```

The request flow is:

```text
Route -> validation/authentication middleware -> controller -> service -> repository -> Prisma -> PostgreSQL
```

## Deployment status

The API is not deployed yet. Follow the local setup instructions above to run it.

For deployment, use a persistent Node.js host such as Render or Railway with a managed PostgreSQL database. Configure all production environment variables from `.env.example`, including a unique `ACCESS_TOKEN_SECRET`, email credentials, the HTTPS frontend URL, and `DATABASE_URL`. Run `npm run build`, apply migrations with `npm run db:deploy`, and start the service with `npm start`. Do not run `prisma migrate dev` in production.

## Assumptions

- All project and task endpoints require a valid access token.
- Seeded accounts are already email-verified for immediate demonstration.
- New accounts must verify their email before login.
- A project owner has access even when they do not also have a `ProjectMember` row.
- Project members can create and view project tasks.
- Only the project owner can update or delete projects and tasks in the current implementation.
- Task assignees must be the project owner, a project member, or `null`.
- List endpoints currently return all matching records without pagination or filtering; those features belong to Level 2 in the task brief.
