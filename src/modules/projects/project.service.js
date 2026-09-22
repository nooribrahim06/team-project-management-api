import {
  ProjectNotFoundError,
  ProjectOwnerRequiredError,
} from "../../middlewares/errorHandling.js";
import * as projectsRepo from "./project.repository.js";

export function createProject(ownerId, data) {
  return projectsRepo.createProject(ownerId, data);
}

