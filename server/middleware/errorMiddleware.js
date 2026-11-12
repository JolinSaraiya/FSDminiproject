function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid resource identifier format',
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      message: messages[0] || 'Validation failed',
      errors: messages,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate value already exists',
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  return res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = {
  notFound,
  errorHandler,
};

