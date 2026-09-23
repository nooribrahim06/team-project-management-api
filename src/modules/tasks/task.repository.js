import { prisma } from "../../lib/prisma.js";
import { DatabaseError } from "../../middlewares/errorHandling.js";

export async function createTask(projectId, taskData, db = prisma) {
  try {
    return await db.task.create({
      data: {
        projectId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignedToId: taskData.assignedToId,
      },
    });
  } catch {
    throw new DatabaseError("Database error occurred while creating the task.");
  }
}

export async function findAllTasksByProjectId(projectId, db = prisma) {
  try {
    return await db.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new DatabaseError("Database error occurred while finding tasks.");
  }
}

export async function findTasksAssignedToUser(userId, db = prisma) {
  try {
    return await db.task.findMany({
      where: { assignedToId: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while finding the user's tasks.",
    );
  }
}

export async function findTaskByIdInProject(
  taskId,
  projectId,
  db = prisma,
) {
  try {
    return await db.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });
  } catch {
    throw new DatabaseError("Database error occurred while finding the task.");
  }
}

export async function updateTask(taskId, taskData, db = prisma) {
  try {
    return await db.task.update({
      where: { id: taskId },
      data: taskData,
    });
  } catch {
    throw new DatabaseError("Database error occurred while updating the task.");
  }
}

export async function deleteTask(taskId, db = prisma) {
  try {
    return await db.task.delete({
      where: { id: taskId },
    });
  } catch {
    throw new DatabaseError("Database error occurred while deleting the task.");
  }
}
