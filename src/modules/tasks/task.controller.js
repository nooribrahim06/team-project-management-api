import * as taskService from "./task.service.js";

function privateResponse(res, statusCode, data) {
  res.set("Cache-Control", "no-store");
  return res.status(statusCode).json({ data });
}

export async function createTaskController(req, res) {
  const result = await taskService.createTask(
    req.user.id,
    req.validatedParams.projectId,
    req.validatedBody,
  );

  return privateResponse(res, 201, result);
}

export async function getAllTasksController(req, res) {
  const result = await taskService.getAllTasks(
    req.user.id,
    req.validatedParams.projectId,
  );

  return privateResponse(res, 200, result);
}

export async function getMyTasksController(req, res) {
  const result = await taskService.getMyTasks(req.user.id);
  return privateResponse(res, 200, result);
}

export async function getTaskByIdController(req, res) {
  const result = await taskService.getTaskById(
    req.user.id,
    req.validatedParams.projectId,
    req.validatedParams.taskId,
  );

  return privateResponse(res, 200, result);
}

export async function updateTaskController(req, res) {
  const result = await taskService.updateTask(
    req.user.id,
    req.validatedParams.projectId,
    req.validatedParams.taskId,
    req.validatedBody,
  );

  return privateResponse(res, 200, result);
}

export async function deleteTaskController(req, res) {
  await taskService.deleteTask(
    req.user.id,
    req.validatedParams.projectId,
    req.validatedParams.taskId,
  );

  res.set("Cache-Control", "no-store");
  return res.status(204).send();
}
