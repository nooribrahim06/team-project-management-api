import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { sendVerificationEmail } from "../../emails/verificationEmail.service.js";
import { prisma } from "../../lib/prisma.js";
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InvalidSessionError,
  InvalidVerificationTokenError,
  RefreshTokenRaceError,
  RefreshTokenReuseError,
} from "../../middlewares/errorHandling.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  replaceVerificationToken,
  verifyUserByToken,
} from "../users/user.repository.js";
import * as tokens from "./auth.tokens.js";
import * as sessionRepository from "./repositories/authSession.repository.js";
import * as refreshTokenRepository from "./repositories/refreshToken.repository.js";

const PASSWORD_SALT_ROUNDS = 12;
const REFRESH_RACE_GRACE_MS = 5_000;
const DUMMY_PASSWORD_HASH =
  "$2b$12$fuJ1FMKdu6mSmVkef.7hd.IdW0ZoL34nJAiOYUR/lYsttCQ8BodrC";
const RESEND_RESPONSE = {
  message:
    "If the account exists and is not verified, a verification email has been sent.",
};

function createEmailVerificationToken() {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");

  return {
    rawToken,
    hashedToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name ?? null,
    avatarUrl: user.profile?.avatarUrl ?? null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function signup({ email, name, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const verificationToken = createEmailVerificationToken();

  await createUser({
    email: normalizedEmail,
    name,
    passwordHash,
    verifyToken: verificationToken.hashedToken,
    verifyTokenExpiresAt: verificationToken.expiresAt,
  });

  const emailResult = await sendVerificationEmail({
    email: normalizedEmail,
    name,
    rawToken: verificationToken.rawToken,
  });

  const response = {
    message: "User created successfully. Check your email to verify your account.",
  };

  if (env.NODE_ENV !== "production" && emailResult.verificationUrl) {
    response.verificationUrl = emailResult.verificationUrl;
  }

  return response;
}

export async function verifyEmail(rawToken) {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const result = await verifyUserByToken(tokenHash);

  if (result.count !== 1) {
    throw new InvalidVerificationTokenError();
  }

  return { message: "Email verified successfully." };
}

export async function resendVerificationEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.emailVerified) {
    return RESEND_RESPONSE;
  }

  const verificationToken = createEmailVerificationToken();
  const result = await replaceVerificationToken({
    userId: user.id,
    verifyToken: verificationToken.hashedToken,
    verifyTokenExpiresAt: verificationToken.expiresAt,
  });

  if (result.count === 1) {
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.profile?.name ?? "User",
        rawToken: verificationToken.rawToken,
      });
    } catch {
      console.error("Verification email delivery failed during resend.");
    }
  }

  return RESEND_RESPONSE;
}

export async function login({ email, password, userAgent, ip }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);
  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordIsValid = await bcrypt.compare(password, passwordHash);

  if (!user || !passwordIsValid || !user.emailVerified) {
    throw new InvalidCredentialsError();
  }

  const rawRefreshToken = tokens.generateRefreshToken();
  const refreshTokenHash = tokens.hashRefreshToken(rawRefreshToken);
  const ipHash = createHash("sha256").update(String(ip)).digest("hex");
  const refreshExpiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRATION * 24 * 60 * 60 * 1000,
  );
  const sessionExpiresAt = new Date(
    Date.now() + env.SESSION_EXPIRATION * 24 * 60 * 60 * 1000,
  );

  const session = await prisma.$transaction(async (db) => {
    const createdSession = await sessionRepository.createSession(
      {
        userId: user.id,
        userAgent: String(userAgent).slice(0, 512),
        ipHash,
        expiresAt: sessionExpiresAt,
      },
      db,
    );

    await refreshTokenRepository.createRefreshToken(
      {
        sessionId: createdSession.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
      },
      db,
    );

    return createdSession;
  });

  return {
    user: publicUser(user),
    accessToken: tokens.createAccessToken({
      userId: user.id,
      sessionId: session.id,
    }),
    refreshToken: rawRefreshToken,
  };
}

export async function refresh(rawRefreshToken) {
  const tokenHash = tokens.hashRefreshToken(rawRefreshToken);
  const storedToken =
    await refreshTokenRepository.findRefreshTokenByHash(tokenHash);
  const now = new Date();

  if (
    !storedToken ||
    storedToken.expiresAt <= now ||
    storedToken.revokedAt !== null
  ) {
    throw new InvalidRefreshTokenError();
  }

  if (storedToken.consumedAt !== null) {
    const reuseAge = now.getTime() - storedToken.consumedAt.getTime();

    if (reuseAge >= 0 && reuseAge <= REFRESH_RACE_GRACE_MS) {
      throw new RefreshTokenRaceError();
    }

    await prisma.$transaction((db) =>
      sessionRepository.revokeSession(storedToken.sessionId, now, db),
    );
    throw new RefreshTokenReuseError();
  }

  const session = await sessionRepository.findSessionById(
    storedToken.sessionId,
  );

  if (!session || session.expiresAt <= now || session.revokedAt !== null) {
    throw new InvalidSessionError();
  }

  const user = await findUserById(session.userId);

  if (!user || !user.emailVerified) {
    throw new InvalidSessionError();
  }

  const newRawRefreshToken = tokens.generateRefreshToken();
  const newRefreshTokenHash = tokens.hashRefreshToken(newRawRefreshToken);
  const refreshWindowEndsAt = new Date(
    now.getTime() + env.REFRESH_TOKEN_EXPIRATION * 24 * 60 * 60 * 1000,
  );
  const newRefreshExpiresAt = new Date(
    Math.min(refreshWindowEndsAt.getTime(), session.expiresAt.getTime()),
  );

  await prisma.$transaction(async (db) => {
    const consumed = await refreshTokenRepository.consumeRefreshToken(
      storedToken.id,
      now,
      db,
    );

    if (consumed.count !== 1) {
      throw new RefreshTokenRaceError();
    }

    const replacement = await refreshTokenRepository.createRefreshToken(
      {
        sessionId: session.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: newRefreshExpiresAt,
      },
      db,
    );

    await refreshTokenRepository.linkReplacement(
      storedToken.id,
      replacement.id,
      db,
    );
    await sessionRepository.updateLastUsedAt(session.id, now, db);
  });

  return {
    user: publicUser(user),
    accessToken: tokens.createAccessToken({
      userId: user.id,
      sessionId: session.id,
    }),
    refreshToken: newRawRefreshToken,
  };
}

export async function logout(rawRefreshToken) {
  const tokenHash = tokens.hashRefreshToken(rawRefreshToken);
  const storedToken =
    await refreshTokenRepository.findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    return;
  }

  await prisma.$transaction((db) =>
    sessionRepository.revokeSession(storedToken.sessionId, new Date(), db),
  );
}

export async function logoutAll(rawRefreshToken) {
  const tokenHash = tokens.hashRefreshToken(rawRefreshToken);
  const storedToken =
    await refreshTokenRepository.findRefreshTokenByHash(tokenHash);
  const now = new Date();

  if (
    !storedToken ||
    storedToken.expiresAt <= now ||
    storedToken.revokedAt !== null ||
    storedToken.consumedAt !== null
  ) {
    return;
  }

  const session = await sessionRepository.findSessionById(
    storedToken.sessionId,
  );

  if (!session || session.expiresAt <= now || session.revokedAt !== null) {
    return;
  }

  await prisma.$transaction((db) =>
    sessionRepository.revokeAllSessionsForUser(session.userId, now, db),
  );
}

export { publicUser };
