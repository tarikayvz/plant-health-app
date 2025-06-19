const express = require("express")
const router = express.Router()
const moistureController = require("../controllers/moistureController")

// Authentication middleware'lerini kaldırdık
// const { authenticate } = require("../middleware/auth") // KALDIRILDI
// router.use(authenticate) // KALDIRILDI

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Moisture route working without authentication",
    timestamp: new Date().toISOString(),
  })
})

// Moisture endpoints - artık authentication yok
router.post("/record", moistureController.recordMoisture)
router.get("/device/:deviceId", moistureController.getMoistureReadings)
router.get("/device/:deviceId/latest", moistureController.getLatestMoisture)

module.exports = router
