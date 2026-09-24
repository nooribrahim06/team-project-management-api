import { InvalidAccessTokenError } from "./errorHandling.js";
import { verifyAccessToken } from "../modules/auth/auth.tokens.js";
import { findSessionById } from "../modules/auth/repositories/authSession.repository.js";
import { findUserById } from "../modules/users/user.repository.js";

export async function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new InvalidAccessTokenError();
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    throw new InvalidAccessTokenError();
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new InvalidAccessTokenError();
  }

  const [user, session] = await Promise.all([
    findUserById(decoded.sub),
    findSessionById(decoded.sid),
  ]);
  const now = new Date();

  if (
    !user ||
    !user.emailVerified ||
    !session ||
    session.userId !== user.id ||
    session.expiresAt <= now ||
    session.revokedAt !== null
  ) {
    throw new InvalidAccessTokenError();
  }

  req.auth = {
    userId: user.id,
    sessionId: session.id,
    tokenId: decoded.jti,
  };
  req.user = user;

  return next();
}
