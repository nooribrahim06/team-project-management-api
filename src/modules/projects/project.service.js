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

