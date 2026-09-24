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

export class DuplicateUserError extends AppError {
  constructor() {
    super(
      "A user with that email already exists.",
      409,
      "USER_ALREADY_EXISTS",
    );
  }
}

export class InvalidVerificationTokenError extends AppError {
  constructor(message = "Verification link is invalid or has expired.") {
    super(message, 400, "INVALID_VERIFICATION_TOKEN");
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password.") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

export class InvalidAccessTokenError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, 401, "INVALID_ACCESS_TOKEN");
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor(message = "Invalid or expired session.") {
    super(message, 401, "INVALID_REFRESH_TOKEN");
  }
}

export class InvalidSessionError extends AppError {
  constructor(message = "Invalid or expired session.") {
    super(message, 401, "INVALID_SESSION");
  }
}

export class RefreshTokenReuseError extends AppError {
  constructor(
    message = "Refresh token reuse was detected. The session has been revoked.",
  ) {
    super(message, 401, "REFRESH_TOKEN_REUSE_DETECTED");
  }
}

export class RefreshTokenRaceError extends AppError {
  constructor(
    message = "The session was refreshed by another request. Please retry.",
  ) {
    super(message, 409, "REFRESH_TOKEN_ALREADY_ROTATED");
  }
}

export class EmailSendError extends AppError {
  constructor(message = "The verification email could not be sent.") {
    super(message, 500, "EMAIL_SEND_FAILED");
  }
}
