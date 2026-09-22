import { prisma } from "../../lib/prisma.js";
import { DatabaseError } from "../../middlewares/errorHandling.js";

export async function createProject(ownerId, projectData, db = prisma) {
  try {
    return await db.project.create({
      data: {
        ownerId,
        name: projectData.name,
        description: projectData.description,
      },
    });
  } catch {
    throw new DatabaseError("Database error occurred while creating the project.");
  }
}
