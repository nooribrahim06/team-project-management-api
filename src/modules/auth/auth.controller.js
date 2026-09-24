import { env } from "../../config/env.js";
import { InvalidSessionError } from "../../middlewares/errorHandling.js";
import * as authService from "./auth.service.js";

export function getRefreshCookieBaseOptions(
  nodeEnv = env.NODE_ENV,
  isVercel = process.env.VERCEL === "1",
) {
  const crossSiteCookie = nodeEnv === "production" || isVercel;

  return {
    httpOnly: true,
    secure: crossSiteCookie,
    sameSite: crossSiteCookie ? "none" : "lax",
    partitioned: crossSiteCookie,
    path: "/",
  };
}

const refreshCookieBaseOptions = getRefreshCookieBaseOptions();
const refreshCookieOptions = {
  ...refreshCookieBaseOptions,
  maxAge: env.REFRESH_TOKEN_EXPIRATION * 24 * 60 * 60 * 1000,
};

function privateResponse(res, statusCode, data) {
  res.set("Cache-Control", "no-store");
  return res.status(statusCode).json({ data });
}

export async function signupController(req, res) {
  const result = await authService.signup(req.validatedBody);
  return privateResponse(res, 201, result);
}

export async function verifyEmailController(req, res) {
  const result = await authService.verifyEmail(req.validatedBody.token);
  return privateResponse(res, 200, result);
}

export async function resendVerificationController(req, res) {
  const result = await authService.resendVerificationEmail(
    req.validatedBody.email,
  );
  return privateResponse(res, 200, result);
}

export async function loginController(req, res) {
  const result = await authService.login({
    email: req.validatedBody.email,
    password: req.validatedBody.password,
    userAgent: req.get("user-agent") ?? "unknown",
    ip: req.ip ?? "unknown",
  });

  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

  return privateResponse(res, 200, {
    user: result.user,
    accessToken: result.accessToken,
  });
}

export async function refreshController(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new InvalidSessionError();
  }

  try {
    const result = await authService.refresh(refreshToken);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return privateResponse(res, 200, {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (
      [
        "INVALID_REFRESH_TOKEN",
        "INVALID_SESSION",
        "REFRESH_TOKEN_REUSE_DETECTED",
      ].includes(error.code)
    ) {
      res.clearCookie("refreshToken", refreshCookieBaseOptions);
    }

    throw error;
  }
}

export async function logoutController(req, res) {
  try {
    if (req.cookies?.refreshToken) {
      await authService.logout(req.cookies.refreshToken);
    }
  } finally {
    res.clearCookie("refreshToken", refreshCookieBaseOptions);
  }

  return privateResponse(res, 200, {
    message: "Logged out successfully.",
  });
}

export async function logoutAllController(req, res) {
  try {
    if (req.cookies?.refreshToken) {
      await authService.logoutAll(req.cookies.refreshToken);
    }
  } finally {
    res.clearCookie("refreshToken", refreshCookieBaseOptions);
  }

  return privateResponse(res, 200, {
    message: "Logged out of all sessions successfully.",
  });
}

export async function getMeController(req, res) {
  return privateResponse(res, 200, authService.publicUser(req.user));
}
