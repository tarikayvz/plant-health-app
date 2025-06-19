const express = require("express")
const router = express.Router()
const plantController = require("../controllers/plantController")
const { validatePlantCreate } = require("../middleware/validators")

// Authentication middleware'lerini kaldırdık
// const { authenticate } = require("../middleware/auth") // KALDIRILDI
// router.use(authenticate) // KALDIRILDI

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Plant route working without authentication",
    timestamp: new Date().toISOString(),
  })
})

// Plant endpoints - artık authentication yok
router.get("/", plantController.getAllPlants)
router.post("/", validatePlantCreate, plantController.createPlant)
router.get("/types", plantController.getAllPlantTypes)
router.get("/:id", plantController.getPlantById)
router.put("/:id", plantController.updatePlant)
router.delete("/:id", plantController.deletePlant)
router.get("/:id/watering-history", plantController.getWateringHistory)
router.get("/:id/health-history", plantController.getHealthHistory)
router.get("/:id/moisture-history", plantController.getMoistureHistory)

module.exports = router
