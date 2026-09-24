import express from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validatebody.js";
import * as controllers from "./task.controller.js";
import * as taskValidation from "./task.validation.js";

export const taskRoutes = express.Router({ mergeParams: true });
export const myTaskRoutes = express.Router();

myTaskRoutes.get("/", authenticateToken, controllers.getMyTasksController);

taskRoutes.use(express.json({ limit: "100kb" }), authenticateToken);

taskRoutes.post(
  "/",
  validateParams(taskValidation.projectIdParamSchema),
  validateBody(taskValidation.createTaskSchema),
  controllers.createTaskController,
);

taskRoutes.get(
  "/",
  validateParams(taskValidation.projectIdParamSchema),
  controllers.getAllTasksController,
);

taskRoutes.get(
  "/:taskId",
  validateParams(taskValidation.taskIdParamSchema),
  controllers.getTaskByIdController,
);

taskRoutes.patch(
  "/:taskId",
  validateParams(taskValidation.taskIdParamSchema),
  validateBody(taskValidation.updateTaskSchema),
  controllers.updateTaskController,
);

taskRoutes.delete(
  "/:taskId",
  validateParams(taskValidation.taskIdParamSchema),
  controllers.deleteTaskController,
);
