const DEVELOPMENT_USER_ID = "00000000-0000-4000-8000-000000000001";

export function authenticateUser(req, res, next) {
  req.user = {
    id: DEVELOPMENT_USER_ID,
  };

  return next();
}
