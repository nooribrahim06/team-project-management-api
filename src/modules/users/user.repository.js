import { prisma } from "../../lib/prisma.js";
import {
  DatabaseError,
  DuplicateUserError,
} from "../../middlewares/errorHandling.js";

const publicUserSelect = {
  id: true,
  email: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      name: true,
      avatarUrl: true,
    },
  },
};

export async function createUser(
  {
    email,
    name,
    passwordHash,
    verifyToken,
    verifyTokenExpiresAt,
  },
  db = prisma,
) {
  try {
    return await db.user.create({
      data: {
        email,
        passwordHash,
        verifyToken,
        verifyTokenExpiresAt,
        profile: {
          create: { name },
        },
      },
      select: publicUserSelect,
    });
  } catch (error) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target
      : [error.meta?.target];

    if (error.code === "P2002" && target.some((field) => field === "email")) {
      throw new DuplicateUserError();
    }

    throw new DatabaseError("Database error occurred while creating the user.");
  }
}

export async function findUserByEmail(email, db = prisma) {
  try {
    return await db.user.findUnique({
      where: { email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
      },
    });
  } catch {
    throw new DatabaseError("Database error occurred while finding the user.");
  }
}

export async function findUserById(userId, db = prisma) {
  try {
    return await db.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
  } catch {
    throw new DatabaseError("Database error occurred while finding the user.");
  }
}

export async function verifyUserByToken(tokenHash, db = prisma) {
  try {
    return await db.user.updateMany({
      where: {
        verifyToken: tokenHash,
        verifyTokenExpiresAt: { gt: new Date() },
        emailVerified: false,
      },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiresAt: null,
      },
    });
  } catch {
    throw new DatabaseError("Database error occurred while verifying the user.");
  }
}

export async function replaceVerificationToken(
  { userId, verifyToken, verifyTokenExpiresAt },
  db = prisma,
) {
  try {
    return await db.user.updateMany({
      where: {
        id: userId,
        emailVerified: false,
      },
      data: {
        verifyToken,
        verifyTokenExpiresAt,
      },
    });
  } catch {
    throw new DatabaseError(
      "Database error occurred while replacing the verification token.",
    );
  }
}
