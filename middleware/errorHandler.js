const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    })
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Duplicate entry",
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    })
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" })
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" })
  }

  // Default error
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  })
}

module.exports = errorHandler
