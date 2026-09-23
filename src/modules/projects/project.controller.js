import * as projectService from "./project.service.js";

function privateResponse(res, statusCode, data) {
  res.set("Cache-Control", "no-store");
  return res.status(statusCode).json({ data });
}

export async function createProjectController(req, res) {
  const result = await projectService.createProject(
    req.user.id,
    req.validatedBody,
  );

  return privateResponse(res, 201, result);
}

export async function getAllProjectsController(req, res) {
  const result = await projectService.getAllProjects(req.user.id);
  return privateResponse(res, 200, result);
}

export async function getProjectByIdController(req, res) {
  const result = await projectService.getProjectById(
    req.user.id,
    req.validatedParams.projectId,
  );

  return privateResponse(res, 200, result);
}
