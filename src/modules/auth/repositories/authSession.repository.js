import { prisma } from "../../../lib/prisma.js";
import { DatabaseError } from "../../../middlewares/errorHandling.js";

export async function createSession(data, db = prisma) {
  try {
    return await db.authSession.create({ data });
  } catch {
    throw new DatabaseError("Database error occurred while creating a session.");
  }
}

export async function findSessionById(sessionId, db = prisma) {
  try {
    return await db.authSession.findUnique({
      where: { id: sessionId },
    });
  } catch {
    throw new DatabaseError("Database error occurred while finding a session.");
  }
}

export async function updateLastUsedAt(sessionId, lastUsedAt, db = prisma) {
  try {
    return await db.authSession.update({
      where: { id: sessionId },
      data: { lastUsedAt },
    });
  } catch {
    throw new DatabaseError("Database error occurred while updating a session.");
  }
}

export async function revokeSession(sessionId, revokedAt, db = prisma) {
  try {
    await db.authSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: { revokedAt },
    });

    await db.refreshToken.updateMany({
      where: {
        sessionId,
        revokedAt: null,
      },
      data: { revokedAt },
    });
  } catch {
    throw new DatabaseError("Database error occurred while revoking a session.");
  }
}

export async function revokeAllSessionsForUser(
  userId,
  revokedAt,
  db = prisma,
) {
  try {
    await db.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt },
    });

    await db.refreshToken.updateMany({
      where: {
        session: { userId },
        revokedAt: null,
      },
      data: { revokedAt },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while revoking the user's sessions.",
    );
  }
}
