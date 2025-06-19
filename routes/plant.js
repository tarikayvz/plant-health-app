const express = require("express")
const router = express.Router()
const plantController = require("../controllers/plantController")
// const { authenticate } = require("../middleware/auth")
const { validatePlantCreate } = require("../middleware/validators")

// router.use(authenticate)

router.get("/types", plantController.getAllPlantTypes)

router.get("/", plantController.getAllPlants)
router.post("/create-Plant", validatePlantCreate, plantController.createPlant)
router.get("/:id", plantController.getPlantById)
router.put("/:id", plantController.updatePlant)
router.delete("/:id", plantController.deletePlant)
router.get("/:id/watering-history", plantController.getWateringHistory)
router.get("/:id/health-history", plantController.getHealthHistory)
router.get("/:id/moisture-history", plantController.getMoistureHistory)

module.exports = router
