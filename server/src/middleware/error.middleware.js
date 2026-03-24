const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  let status = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid resource id";
  }

  if (err.name === "ValidationError") {
    status = 400;
    message = err.message || "Validation error";
  }

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate resource";
  }

  return res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
