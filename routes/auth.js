const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { validateRegister, validateLogin } = require("../middleware/validators")

router.post("/register", validateRegister, authController.register)
router.post("/login", validateLogin, authController.login)
router.post("/refresh-token", authController.refreshToken)
router.post("/logout", authController.logout)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)
router.post("/update-fcm-token", authController.updateFcmToken)

module.exports = router
