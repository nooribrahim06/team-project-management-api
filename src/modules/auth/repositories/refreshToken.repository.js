import { prisma } from "../../../lib/prisma.js";
import { DatabaseError } from "../../../middlewares/errorHandling.js";

export async function createRefreshToken(data, db = prisma) {
  try {
    return await db.refreshToken.create({ data });
  } catch {
    throw new DatabaseError(
      "Database error occurred while creating a refresh token.",
    );
  }
}

export async function findRefreshTokenByHash(tokenHash, db = prisma) {
  try {
    return await db.refreshToken.findUnique({
      where: { tokenHash },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while finding a refresh token.",
    );
  }
}

export async function consumeRefreshToken(tokenId, consumedAt, db = prisma) {
  try {
    return await db.refreshToken.updateMany({
      where: {
        id: tokenId,
        consumedAt: null,
        revokedAt: null,
        expiresAt: { gt: consumedAt },
      },
      data: { consumedAt },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while consuming a refresh token.",
    );
  }
}

export async function linkReplacement(
  oldTokenId,
  newTokenId,
  db = prisma,
) {
  try {
    return await db.refreshToken.update({
      where: { id: oldTokenId },
      data: { replacedByTokenId: newTokenId },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while rotating a refresh token.",
    );
  }
}
