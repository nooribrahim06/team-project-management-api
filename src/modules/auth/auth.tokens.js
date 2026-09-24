import { createHash, randomBytes, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "team-project-management-api";
const JWT_AUDIENCE = "team-project-management-api";

export function createAccessToken({ userId, sessionId }) {
  return jwt.sign(
    {
      typ: "access",
      sid: sessionId,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      subject: userId,
      jwtid: randomUUID(),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: env.ACCESS_TOKEN_EXPIRATION,
    },
  );
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  if (
    typeof decoded !== "object" ||
    decoded.typ !== "access" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.sid !== "string" ||
    typeof decoded.jti !== "string"
  ) {
    throw new jwt.JsonWebTokenError("JWT claims are invalid.");
  }

  return decoded;
}

export function generateRefreshToken() {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
