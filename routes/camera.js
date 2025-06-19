const express = require("express")
const router = express.Router()
const cameraController = require("../controllers/cameraController")
const multer = require("multer")

// Multer configuration for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Authentication middleware'lerini kaldırdık
// const { authenticate } = require("../middleware/auth") // KALDIRILDI
// router.use(authenticate) // KALDIRILDI

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Camera route working without authentication",
    timestamp: new Date().toISOString(),
  })
})

// Camera endpoints - artık authentication yok
router.post("/upload", upload.single("image"), cameraController.uploadImage)
router.get("/device/:deviceId/latest", cameraController.getLatestCapture)
router.get("/device/:deviceId/all", cameraController.getAllCaptures)

module.exports = router
