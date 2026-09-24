import express from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import {
  loginRateLimiter,
  sessionRateLimiter,
  signupRateLimiter,
  verificationRateLimiter,
} from "../../middlewares/rateLimiter.js";
import { validateBody } from "../../middlewares/validatebody.js";
import * as controllers from "./auth.controller.js";
import * as validation from "./auth.validation.js";

export const authRoutes = express.Router();

authRoutes.use(express.json({ limit: "100kb" }));

authRoutes.post(
  "/signup",
  signupRateLimiter,
  validateBody(validation.signupSchema),
  controllers.signupController,
);

authRoutes.post(
  "/verify-email",
  verificationRateLimiter,
  validateBody(validation.verifyEmailSchema),
  controllers.verifyEmailController,
);

authRoutes.post(
  "/resend-verification",
  verificationRateLimiter,
  validateBody(validation.resendVerificationSchema),
  controllers.resendVerificationController,
);

authRoutes.post(
  "/login",
  loginRateLimiter,
  validateBody(validation.loginSchema),
  controllers.loginController,
);

authRoutes.post(
  "/refresh",
  sessionRateLimiter,
  controllers.refreshController,
);
authRoutes.post(
  "/logout",
  sessionRateLimiter,
  controllers.logoutController,
);
authRoutes.post(
  "/logout-all",
  sessionRateLimiter,
  controllers.logoutAllController,
);
authRoutes.get("/me", authenticateToken, controllers.getMeController);
