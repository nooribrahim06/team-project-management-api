import {
  InvalidTaskAssigneeError,
  ProjectAccessDeniedError,
  ProjectNotFoundError,
  ProjectOwnerRequiredError,
  TaskNotFoundError,
} from "../../middlewares/errorHandling.js";
import * as projectsRepo from "../projects/project.repository.js";
import * as tasksRepo from "./task.repository.js";

export async function createTask(userId, projectId, data) {
  const project = await getAccessibleProject(projectId, userId);
  await validateAssignee(project, data.assignedToId);
  return tasksRepo.createTask(projectId, data);
}

export async function getAllTasks(userId, projectId) {
  await getAccessibleProject(projectId, userId);
  return tasksRepo.findAllTasksByProjectId(projectId);
}

export async function getTaskById(userId, projectId, taskId) {
  await getAccessibleProject(projectId, userId);
  return getExistingTask(taskId, projectId);
}

export async function updateTask(userId, projectId, taskId, data) {
  const project = await getOwnedProject(projectId, userId);
  const task = await getExistingTask(taskId, projectId);
  await validateAssignee(project, data.assignedToId);
  return tasksRepo.updateTask(task.id, data);
}

export async function deleteTask(userId, projectId, taskId) {
  await getOwnedProject(projectId, userId);
  const task = await getExistingTask(taskId, projectId);
  await tasksRepo.deleteTask(task.id);
}

async function getAccessibleProject(projectId, userId) {
  const projectWithMembership =
    await projectsRepo.findProjectByIdWithUserMembership(projectId, userId);

  if (!projectWithMembership) {
    throw new ProjectNotFoundError();
  }

  const { members, ...project } = projectWithMembership;

  if (project.ownerId !== userId && members.length === 0) {
    throw new ProjectAccessDeniedError();
  }

  return project;
}

async function getOwnedProject(projectId, userId) {
  const project = await projectsRepo.findProjectById(projectId);

  if (!project) {
    throw new ProjectNotFoundError();
  }

  if (project.ownerId !== userId) {
    throw new ProjectOwnerRequiredError();
  }

  return project;
}

async function getExistingTask(taskId, projectId) {
  const task = await tasksRepo.findTaskByIdInProject(taskId, projectId);

  if (!task) {
    throw new TaskNotFoundError();
  }

  return task;
}

async function validateAssignee(project, assignedToId) {
  if (assignedToId === undefined || assignedToId === null) {
    return;
  }

  if (project.ownerId === assignedToId) {
    return;
  }

  const member = await projectsRepo.findProjectMember(
    project.id,
    assignedToId,
  );

  if (!member) {
    throw new InvalidTaskAssigneeError();
  }
}
