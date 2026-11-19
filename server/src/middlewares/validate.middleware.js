import { ApiError } from "../utils/ApiError.js";

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ApiError(
        400,
        "VALIDATION_ERROR",
        "Request validation failed",
        result.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      ));
    }

    req.validatedBody = result.data;
    next();
  };
}
