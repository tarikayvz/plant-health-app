const { MoistureReading, Device, Plant } = require("../models")
const notificationService = require("../services/notificationService")
const { Op } = require("sequelize")

exports.recordMoisture = async (req, res, next) => {
  try {
    const { deviceIdentifier, moistureLevel, timestamp } = req.body

    // Find device by identifier
    const device = await Device.findOne({ where: { deviceIdentifier } })
    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Create moisture reading
    const reading = await MoistureReading.create({
      deviceId: device.id,
      moistureLevel,
      timestamp: timestamp || new Date(),
    })

    // Update plants associated with this device
    const plants = await Plant.findAll({ where: { deviceId: device.id } })
    for (const plant of plants) {
      await plant.update({ currentMoisture: moistureLevel })
    }

    // Check if moisture level is below threshold
    if (moistureLevel < device.moistureThreshold) {
      // Send notification
      await notificationService.sendMoistureAlert(device.id, moistureLevel)

      // Update reading to mark notification as sent
      await reading.update({ notificationSent: true })
    }

    res.status(201).json({
      message: "Moisture reading recorded successfully",
      reading,
    })
  } catch (error) {
    next(error)
  }
}

exports.getMoistureReadings = async (req, res, next) => {
  try {
    const { deviceId } = req.params
    const { days = 7 } = req.query

    // Check if device belongs to user
    const device = await Device.findOne({
      where: { id: deviceId, userId: req.user.id },
    })

    if (!device) {
      return res.status(404).json({ message: "Device not found or does not belong to user" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    // Get moisture readings
    const readings = await MoistureReading.findAll({
      where: {
        deviceId,
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["timestamp", "ASC"]],
    })

    res.status(200).json({
      message: "Moisture readings retrieved successfully",
      readings,
    })
  } catch (error) {
    next(error)
  }
}
