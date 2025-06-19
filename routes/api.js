const express = require("express")
const router = express.Router()
// const { authenticate } = require("../middleware/auth")
const deviceController = require("../controllers/deviceController")
const plantController = require("../controllers/plantController")
const moistureController = require("../controllers/moistureController")
const cameraController = require("../controllers/cameraController")
const notificationController = require("../controllers/notificationController") // Added import for notificationController

// Device API endpoints for IoT devices
// router.post("/device/register", deviceController.registerDevice)
router.post("/device/moisture", deviceController.recordMoisture)
router.post("/device/camera", cameraController.uploadImage)
router.post("/device/water", deviceController.recordWatering)

// API endpoints for Flutter mobile app
router.use("/mobile", authenticate)
router.get("/mobile/plants", plantController.getAllPlants)
router.get("/mobile/plants/:id", plantController.getPlantById)
router.get("/mobile/moisture/:deviceId", moistureController.getMoistureReadings)
router.post("/mobile/water/:plantId", plantController.waterPlant)
router.get("/mobile/notifications", notificationController.getUserNotifications)
router.put("/mobile/notifications/:id/read", notificationController.markNotificationAsRead)

module.exports = router
