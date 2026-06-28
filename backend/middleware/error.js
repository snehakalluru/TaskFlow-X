class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.originalUrl}` },
  });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details;

  res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
  });
}

module.exports = {
  notFound,
  errorHandler,
  ApiError,
};

