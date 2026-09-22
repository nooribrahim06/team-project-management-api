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
