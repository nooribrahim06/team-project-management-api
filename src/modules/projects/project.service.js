import {
  ProjectAccessDeniedError,
  ProjectNotFoundError,
  ProjectOwnerRequiredError,
} from "../../middlewares/errorHandling.js";
import * as projectsRepo from "./project.repository.js";

export function createProject(ownerId, data) {
  return projectsRepo.createProject(ownerId, data);
}

export function getAllProjects(userId) {
  return projectsRepo.findAllProjectsForUser(userId);
}

export async function getProjectById(userId, projectId) {
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


export async function updateProject(ownerId, projectId, data) {
  const project = await getOwnedProject(projectId, ownerId);
  return projectsRepo.updateProject(project.id, data);
}

export async function deleteProject(ownerId, projectId) {
  const project = await getOwnedProject(projectId, ownerId);
  await projectsRepo.deleteProject(project.id);
}

async function getExistingProject(projectId) {
  const project = await projectsRepo.findProjectById(projectId);

  if (!project) {
    throw new ProjectNotFoundError();
  }

  return project;
}

async function getOwnedProject(projectId, ownerId) {
  const project = await getExistingProject(projectId);

  if (project.ownerId !== ownerId) {
    throw new ProjectOwnerRequiredError();
  }

  return project;
}
