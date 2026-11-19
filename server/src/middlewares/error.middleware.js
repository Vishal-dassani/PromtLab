export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.originalUrl} not found`,
    },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = error.statusCode || error.status || 500;
  const response = {
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: status === 500 && process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message,
    },
  };

  if (error.details) response.error.details = error.details;
  if (status === 500) console.error(error);

  res.status(status).json(response);
}
