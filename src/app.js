import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { RouteNotFoundError } from "./middlewares/errorHandling.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { projectRoutes } from "./modules/projects/project.routes.js";
import {
  myTaskRoutes,
  taskRoutes,
} from "./modules/tasks/task.routes.js";

export const app = express();
export default app;
app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);

app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || requestOrigin === env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use("/api", apiRateLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", myTaskRoutes);

app.use((req, res, next) => {
  next(new RouteNotFoundError(req.method, req.originalUrl));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const invalidJson = error.type === "entity.parse.failed";
  const tooLarge = error.type === "entity.too.large";
  const isOperational = error.isOperational === true;

  if (
    env.NODE_ENV !== "test" &&
    (!isOperational || error.statusCode >= 500)
  ) {
    console.error(error);
  }

  const statusCode = invalidJson
    ? 400
    : tooLarge
      ? 413
      : isOperational
        ? error.statusCode
        : 500;

  const code = invalidJson
    ? "INVALID_JSON"
    : tooLarge
      ? "ENTITY_TOO_LARGE"
      : isOperational
        ? error.code
        : "INTERNAL_SERVER_ERROR";

  const message = invalidJson
    ? "Request body contains invalid JSON."
    : tooLarge
      ? "Request body is too large."
      : isOperational
        ? error.message
        : "Internal Server Error";

  const responseBody = {
    error: message,
    code,
  };

  if (isOperational && error.details !== null) {
    responseBody.details = error.details;
  }

  return res.status(statusCode).json(responseBody);
});
