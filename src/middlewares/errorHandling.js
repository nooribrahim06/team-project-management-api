export class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidSchemaError extends AppError {
  constructor(details) {
    super("Validation failed.", 400, "INVALID_SCHEMA", details);
  }
}

export class ProjectNotFoundError extends AppError {
  constructor(message = "Project was not found.") {
    super(message, 404, "PROJECT_NOT_FOUND");
  }
}

export class ProjectOwnerRequiredError extends AppError {
  constructor(message = "Only the project owner can perform this action.") {
    super(message, 403, "PROJECT_OWNER_REQUIRED");
  }
}

export class ProjectAccessDeniedError extends AppError {
  constructor(message = "You do not have access to this project.") {
    super(message, 403, "PROJECT_ACCESS_DENIED");
  }
}

export class TaskNotFoundError extends AppError {
  constructor(message = "Task was not found.") {
    super(message, 404, "TASK_NOT_FOUND");
  }
}

export class InvalidTaskAssigneeError extends AppError {
  constructor(
    message = "The assignee must be the project owner or a project member.",
  ) {
    super(message, 400, "INVALID_TASK_ASSIGNEE");
  }
}

export class RouteNotFoundError extends AppError {
  constructor(method, path) {
    super(
      `Route ${method} ${path} was not found.`,
      404,
      "ROUTE_NOT_FOUND",
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred.") {
    super(message, 500, "DATABASE_ERROR");
  }
}
