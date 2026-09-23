import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
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
  authenticateUser,
  validateBody(projectValidation.createProjectSchema),
  controllers.createProjectController,
);

projectRoutes.get(
  "/",
  authenticateUser,
  controllers.getAllProjectsController,
);

projectRoutes.get(
  "/:projectId",
  authenticateUser,
  validateParams(projectValidation.projectIdParamSchema),
  controllers.getProjectByIdController,
);

projectRoutes.patch(
  "/:projectId",
  authenticateUser,
  validateParams(projectValidation.projectIdParamSchema),
  validateBody(projectValidation.updateProjectSchema),
  controllers.updateProjectController,
);

projectRoutes.delete(
  "/:projectId",
  authenticateUser,
  validateParams(projectValidation.projectIdParamSchema),
  controllers.deleteProjectController,
);
