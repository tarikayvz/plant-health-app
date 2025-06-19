const express = require("express")
const router = express.Router()
const deviceController = require("../controllers/deviceController")
const { validateDeviceCreate } = require("../middleware/validators")

// Authentication middleware'lerini kaldırdık
// const { authenticate } = require("../middleware/auth") // KALDIRILDI
// router.use(authenticate) // KALDIRILDI

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Device route working without authentication",
    timestamp: new Date().toISOString(),
  })
})

// Device endpoints - artık authentication yok
router.get("/", deviceController.getAllDevices)
router.post("/", validateDeviceCreate, deviceController.createDevice)
router.get("/:id", deviceController.getDeviceById)
router.put("/:id", deviceController.updateDevice)
router.delete("/:id", deviceController.deleteDevice)
router.post("/:id/connect", deviceController.connectDevice)
router.post("/:id/toggle-auto-watering", deviceController.toggleAutoWatering)
router.put("/:id/moisture-threshold", deviceController.updateMoistureThreshold)

module.exports = router
