const express = require("express")
const router = express.Router()
const deviceController = require("../controllers/deviceController")
const { authenticate } = require("../middleware/auth")
const { validateDeviceCreate } = require("../middleware/validators")

router.use(authenticate)

router.get("/get-All-Devices", deviceController.getAllDevices)
router.post("/create-device", validateDeviceCreate, deviceController.createDevice)
router.get("/:id", deviceController.getDeviceById)
router.put("/:id", deviceController.updateDevice)
router.delete("/:id", deviceController.deleteDevice)
router.post("/:id/connect", deviceController.connectDevice)
router.post("/:id/toggle-auto-watering", deviceController.toggleAutoWatering)
router.put("/:id/moisture-threshold", deviceController.updateMoistureThreshold)

module.exports = router
