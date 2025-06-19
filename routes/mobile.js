const express = require("express")
const router = express.Router()
const mobileController = require("../controllers/mobileController")

// Mobil uygulama için özel route'lar - authentication yok

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Mobile route working",
    timestamp: new Date().toISOString(),
  })
})

// Mobile endpoints
router.get("/dashboard", mobileController.getDashboard)
router.get("/device/:deviceId/summary", mobileController.getDeviceSummary)

module.exports = router
