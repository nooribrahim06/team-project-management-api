import express from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validatebody.js";
import * as controllers from "./project.controller.js";
import * as projectValidation from "./project.validation.js";

export const projectRoutes = express.Router();

projectRoutes.use(express.json({ limit: "100kb" }));

projectRoutes.post(
  "/",
  authenticateToken,
  validateBody(projectValidation.createProjectSchema),
  controllers.createProjectController,
);

projectRoutes.get(
  "/",
  authenticateToken,
  controllers.getAllProjectsController,
);

projectRoutes.get(
  "/:projectId",
  authenticateToken,
  validateParams(projectValidation.projectIdParamSchema),
  controllers.getProjectByIdController,
);

projectRoutes.patch(
  "/:projectId",
  authenticateToken,
  validateParams(projectValidation.projectIdParamSchema),
  validateBody(projectValidation.updateProjectSchema),
  controllers.updateProjectController,
);

projectRoutes.delete(
  "/:projectId",
  authenticateToken,
  validateParams(projectValidation.projectIdParamSchema),
  controllers.deleteProjectController,
);
