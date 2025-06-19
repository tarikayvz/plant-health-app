const { Plant, PlantType, WateringHistory, HealthHistory, MoistureReading, Device } = require("../models")
const { Op } = require("sequelize")

exports.getAllPlants = async (req, res, next) => {
  try {
    const userId = req.user.id

    const plants = await Plant.findAll({
      where: { userId },
      include: [
        {
          model: PlantType,
          attributes: ["id", "name", "scientificName", "idealMoisture", "wateringFrequency", "imageUrl"],
        },
        {
          model: Device,
          attributes: ["id", "name", "location"],
        },
      ],
    })

    res.status(200).json({
      message: "Plants retrieved successfully",
      plants,
    })
  } catch (error) {
    next(error)
  }
}

exports.createPlant = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, deviceId, plantTypeId, plantedDate, notes, imageUrl } = req.body

    // Check if device exists and belongs to user
    const device = await Device.findOne({ where: { id: deviceId, userId } })
    if (!device) {
      return res.status(404).json({ message: "Device not found or does not belong to user" })
    }

    // Check if plant type exists
    const plantType = await PlantType.findByPk(plantTypeId)
    if (!plantType) {
      return res.status(404).json({ message: "Plant type not found" })
    }

    // Create new plant
    const plant = await Plant.create({
      userId,
      deviceId,
      plantTypeId,
      name,
      plantedDate: plantedDate || new Date(),
      notes,
      imageUrl,
      currentHealth: "healthy",
    })

    // Get the created plant with associations
    const createdPlant = await Plant.findByPk(plant.id, {
      include: [
        {
          model: PlantType,
          attributes: ["id", "name", "scientificName", "idealMoisture", "wateringFrequency", "imageUrl"],
        },
        {
          model: Device,
          attributes: ["id", "name", "location"],
        },
      ],
    })

    res.status(201).json({
      message: "Plant created successfully",
      plant: createdPlant,
    })
  } catch (error) {
    next(error)
  }
}

exports.getPlantById = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const plant = await Plant.findOne({
      where: { id, userId },
      include: [
        {
          model: PlantType,
          attributes: [
            "id",
            "name",
            "scientificName",
            "idealMoisture",
            "wateringFrequency",
            "imageUrl",
            "careInstructions",
          ],
        },
        {
          model: Device,
          attributes: ["id", "name", "location", "autoWatering", "moistureThreshold"],
        },
      ],
    })

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

    res.status(200).json({
      message: "Plant retrieved successfully",
      plant,
    })
  } catch (error) {
    next(error)
  }
}

exports.updatePlant = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { name, deviceId, plantTypeId, notes, imageUrl } = req.body

    const plant = await Plant.findOne({ where: { id, userId } })

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

    // If deviceId is provided, check if it exists and belongs to user
    if (deviceId) {
      const device = await Device.findOne({ where: { id: deviceId, userId } })
      if (!device) {
        return res.status(404).json({ message: "Device not found or does not belong to user" })
      }
    }

    // If plantTypeId is provided, check if it exists
    if (plantTypeId) {
      const plantType = await PlantType.findByPk(plantTypeId)
      if (!plantType) {
        return res.status(404).json({ message: "Plant type not found" })
      }
    }

    // Update plant
    await plant.update({
      name: name || plant.name,
      deviceId: deviceId || plant.deviceId,
      plantTypeId: plantTypeId || plant.plantTypeId,
      notes: notes !== undefined ? notes : plant.notes,
      imageUrl: imageUrl || plant.imageUrl,
    })

    // Get the updated plant with associations
    const updatedPlant = await Plant.findByPk(plant.id, {
      include: [
        {
          model: PlantType,
          attributes: ["id", "name", "scientificName", "idealMoisture", "wateringFrequency", "imageUrl"],
        },
        {
          model: Device,
          attributes: ["id", "name", "location"],
        },
      ],
    })

    res.status(200).json({
      message: "Plant updated successfully",
      plant: updatedPlant,
    })
  } catch (error) {
    next(error)
  }
}

exports.deletePlant = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const plant = await Plant.findOne({ where: { id, userId } })

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

    // Delete plant
    await plant.destroy()

    res.status(200).json({
      message: "Plant deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

exports.getWateringHistory = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { limit = 10, offset = 0 } = req.query

    // Check if plant exists and belongs to user
    const plant = await Plant.findOne({ where: { id, userId } })
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

    // Get watering history
    const wateringHistory = await WateringHistory.findAndCountAll({
      where: { plantId: id },
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["timestamp", "DESC"]],
    })

    res.status(200).json({
      message: "Watering history retrieved successfully",
      count: wateringHistory.count,
      wateringHistory: wateringHistory.rows,
    })
  } catch (error) {
    next(error)
  }
}

exports.getHealthHistory = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { limit = 10, offset = 0 } = req.query

    // Check if plant exists and belongs to user
    const plant = await Plant.findOne({ where: { id, userId } })
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

    // Get health history
    const healthHistory = await HealthHistory.findAndCountAll({
      where: { plantId: id },
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["timestamp", "DESC"]],
    })

    res.status(200).json({
      message: "Health history retrieved successfully",
      count: healthHistory.count,
      healthHistory: healthHistory.rows,
    })
  } catch (error) {
    next(error)
  }
}

exports.getMoistureHistory = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { days = 7, interval = "hour" } = req.query

    // Check if plant exists and belongs to user
    const plant = await Plant.findOne({ where: { id, userId } })
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    // Get moisture readings
    const moistureReadings = await MoistureReading.findAll({
      where: {
        deviceId: plant.deviceId,
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["timestamp", "ASC"]],
    })

    // Process data based on interval
    let processedData = []
    if (interval === "hour") {
      // Group by hour
      const hourlyData = {}
      moistureReadings.forEach((reading) => {
        const hour = new Date(reading.timestamp).setMinutes(0, 0, 0)
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sum: 0, count: 0 }
        }
        hourlyData[hour].sum += reading.moistureLevel
        hourlyData[hour].count += 1
      })

      // Calculate averages
      Object.keys(hourlyData).forEach((hour) => {
        processedData.push({
          timestamp: new Date(Number.parseInt(hour)),
          moistureLevel: Math.round(hourlyData[hour].sum / hourlyData[hour].count),
        })
      })
    } else if (interval === "day") {
      // Group by day
      const dailyData = {}
      moistureReadings.forEach((reading) => {
        const day = new Date(reading.timestamp).setHours(0, 0, 0, 0)
        if (!dailyData[day]) {
          dailyData[day] = { sum: 0, count: 0 }
        }
        dailyData[day].sum += reading.moistureLevel
        dailyData[day].count += 1
      })

      // Calculate averages
      Object.keys(dailyData).forEach((day) => {
        processedData.push({
          timestamp: new Date(Number.parseInt(day)),
          moistureLevel: Math.round(dailyData[day].sum / dailyData[day].count),
        })
      })
    } else {
      // Raw data
      processedData = moistureReadings.map((reading) => ({
        timestamp: reading.timestamp,
        moistureLevel: reading.moistureLevel,
      }))
    }

    res.status(200).json({
      message: "Moisture history retrieved successfully",
      moistureHistory: processedData,
    })
  } catch (error) {
    next(error)
  }
}

// controllers/plantTypeController.js


exports.getAllPlantTypes = async (req, res, next) => {
  try {
    const plantTypes = await PlantType.findAll()
    res.status(200).json({ plantTypes })
  } catch (error) {
    next(error)
  }
}
