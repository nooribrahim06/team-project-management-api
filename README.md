# Team Project Management API

A REST API for organizing team projects and their tasks. It supports project and task CRUD operations, project membership, task assignment, validation, consistent errors, and PostgreSQL persistence.

This project is the backend technical task for Cairo University Racing Team, season 2026-2027.

## Technologies

- Node.js and Express 5
- PostgreSQL
- Prisma ORM 7
- Zod validation
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

It also includes some work beyond Level 1: project access checks, owner-only update/delete operations, project-member task assignment checks, and centralized error handling.

Real registration, login, password hashing, and token authentication are intentionally not implemented yet. They belong to Level 2.

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

4. Create an empty PostgreSQL database and set `DATABASE_URL` in `.env`:

   ```env
   HOST=localhost
   PORT=3000
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/team_project_management"
   ```

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

## Development user

Level 1 does not require authentication. Until real authentication is added, the authentication middleware treats every request as this seeded development user:

```text
00000000-0000-4000-8000-000000000001
```

No authentication header is currently required. This temporary behavior must be replaced by registration, login, and token verification for Level 2.

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

## Project endpoints

| Method | Endpoint | Description | Access rule |
| --- | --- | --- | --- |
| `POST` | `/api/projects` | Create a project | Development user |
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
| `GET` | `/api/tasks` | List all tasks assigned to the current user across projects | Development user |

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
User 1 --- many Project (owner)
User many --- many Project (through ProjectMember)
Project 1 --- many Task
User 1 --- many Task (optional assignee)
```

Important integrity rules:

- User email addresses are unique.
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
  lib/                 Shared Prisma client
  middlewares/         Authentication, validation, and errors
  modules/
    projects/          Project routes, controller, service, repository, validation
    tasks/             Task routes, controller, service, repository, validation
  app.js               Express application and route registration
  index.js             Database connection and server entry point
```

The request flow is:

```text
Route -> validation/authentication middleware -> controller -> service -> repository -> Prisma -> PostgreSQL
```

## Deployment status

The API is not deployed yet. Follow the local setup instructions above to run it.

For deployment, use a persistent Node.js host such as Render or Railway with a managed PostgreSQL database. Configure `DATABASE_URL`, run `npm run build`, apply migrations with `npm run db:deploy`, and start the service with `npm start`. Do not run `prisma migrate dev` in production.

## Assumptions

- Level 1 requests run as one fixed seeded user because real authentication is a Level 2 requirement.
- A project owner has access even when they do not also have a `ProjectMember` row.
- Project members can create and view project tasks.
- Only the project owner can update or delete projects and tasks in the current implementation.
- Task assignees must be the project owner, a project member, or `null`.
- List endpoints currently return all matching records without pagination or filtering; those features belong to Level 2 in the task brief.
