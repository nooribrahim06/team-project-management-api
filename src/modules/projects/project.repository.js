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

export async function findAllProjectsForUser(userId, db = prisma) {
  try {
    return await db.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while finding the user's projects.",
    );
  }
}

export async function findProjectByIdWithUserMembership(
  projectId,
  userId,
  db = prisma,
) {
  try {
    return await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
          select: { id: true },
        },
      },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while finding the user's project.",
    );
  }
}

export async function findProjectById(projectId, db = prisma) {
  try {
    return await db.project.findUnique({
      where: { id: projectId },
    });
  } catch {
    throw new DatabaseError("Database error occurred while finding the project.");
  }
}

export async function updateProject(projectId, data, db = prisma) {
  try {
    return await db.project.update({
      where: { id: projectId },
      data,
    });
  } catch {
    throw new DatabaseError("Database error occurred while updating the project.");
  }
}

export async function deleteProject(projectId, db = prisma) {
  try {
    return await db.project.delete({
      where: { id: projectId },
    });
  } catch {
    throw new DatabaseError("Database error occurred while deleting the project.");
  }
}
