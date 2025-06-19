const { body, validationResult } = require("express-validator")

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      errors: errors.array().map((err) => ({ field: err.param, message: err.msg })),
    })
  }
  next()
}

// User registration validation
exports.validateRegister = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Must be a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  validate,
]

// User login validation
exports.validateLogin = [
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Must be a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
]

// Device creation validation
exports.validateDeviceCreate = [
  body("name")
    .notEmpty()
    .withMessage("Device name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Device name must be between 2 and 50 characters"),

  body("deviceIdentifier")
    .notEmpty()
    .withMessage("Device identifier is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Device identifier must be between 3 and 50 characters"),

  validate,
]

// Plant creation validation
exports.validatePlantCreate = [
  body("name")
    .notEmpty()
    .withMessage("Plant name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Plant name must be between 2 and 50 characters"),

  body("deviceId")
    .notEmpty()
    .withMessage("Device ID is required")
    .isUUID()
    .withMessage("Device ID must be a valid UUID"),

  body("plantTypeId")
    .notEmpty()
    .withMessage("Plant type ID is required")
    .isUUID()
    .withMessage("Plant type ID must be a valid UUID"),

  validate,
]

// Moisture threshold validation
exports.validateMoistureThreshold = [
  body("threshold")
    .notEmpty()
    .withMessage("Threshold value is required")
    .isInt({ min: 0, max: 100 })
    .withMessage("Threshold must be between 0 and 100"),

  validate,
]

// Notification validation
exports.validateNotification = [
  body("title")
    .notEmpty()
    .withMessage("Notification title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters"),

  body("message")
    .notEmpty()
    .withMessage("Notification message is required")
    .isLength({ min: 2, max: 500 })
    .withMessage("Message must be between 2 and 500 characters"),

  body("type")
    .notEmpty()
    .withMessage("Notification type is required")
    .isIn(["moisture", "health", "system", "other"])
    .withMessage("Invalid notification type"),

  validate,
]

// FCM token validation
exports.validateFcmToken = [
  body("fcmToken")
    .notEmpty()
    .withMessage("FCM token is required")
    .isLength({ min: 10 })
    .withMessage("Invalid FCM token format"),

  validate,
]
