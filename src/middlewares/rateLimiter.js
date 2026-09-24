import rateLimit from "express-rate-limit";

function createRateLimiter(limit, message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    message: {
      error: message,
      code: "TOO_MANY_REQUESTS",
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
}

export const apiRateLimiter = createRateLimiter(
  300,
  "Too many requests. Please try again later.",
);
export const signupRateLimiter = createRateLimiter(
  5,
  "Too many signup attempts. Please try again later.",
);
export const loginRateLimiter = createRateLimiter(
  10,
  "Too many login attempts. Please try again later.",
);
export const verificationRateLimiter = createRateLimiter(
  10,
  "Too many verification attempts. Please try again later.",
);
export const sessionRateLimiter = createRateLimiter(
  100,
  "Too many session requests. Please try again later.",
);
