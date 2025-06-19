const { Device, Plant, User, PlantType, MoistureReading, CameraCapture } = require("../models")
const { Op } = require("sequelize")

// Mobil uygulama için ana dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    // Tüm cihazları getir
    const devices = await Device.findAll({
      include: [
        {
          model: Plant,
          include: [{ model: PlantType }],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    })

    // Tüm bitkileri getir
    const plants = await Plant.findAll({
      include: [{ model: Device }, { model: PlantType }, { model: User, attributes: ["id", "name", "email"] }],
    })

    // Son 24 saatteki nem okumaları
    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)

    const recentMoistureReadings = await MoistureReading.findAll({
      where: {
        timestamp: {
          [Op.gte]: last24Hours,
        },
      },
      include: [{ model: Device }],
      order: [["timestamp", "DESC"]],
      limit: 10,
    })

    // Son kamera görüntüleri
    const recentCaptures = await CameraCapture.findAll({
      include: [{ model: Device }],
      order: [["timestamp", "DESC"]],
      limit: 5,
    })

    // İstatistikler
    const stats = {
      totalDevices: devices.length,
      totalPlants: plants.length,
      activeDevices: devices.filter((d) => d.isActive).length,
      healthyPlants: plants.filter((p) => p.currentHealth === "healthy").length,
      lowMoisturePlants: plants.filter((p) => p.currentMoisture < 30).length,
    }

    res.json({
      message: "Dashboard data retrieved successfully",
      data: {
        devices,
        plants,
        recentMoistureReadings,
        recentCaptures,
        stats,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cihaz özeti
exports.getDeviceSummary = async (req, res, next) => {
  try {
    const { deviceId } = req.params

    const device = await Device.findOne({
      where: { id: deviceId },
      include: [
        {
          model: Plant,
          include: [{ model: PlantType }],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Son nem okuma
    const latestMoisture = await MoistureReading.findOne({
      where: { deviceId },
      order: [["timestamp", "DESC"]],
    })

    // Son kamera görüntüsü
    const latestCapture = await CameraCapture.findOne({
      where: { deviceId },
      order: [["timestamp", "DESC"]],
    })

    // Son 7 günün nem verileri
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const moistureHistory = await MoistureReading.findAll({
      where: {
        deviceId,
        timestamp: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      order: [["timestamp", "ASC"]],
    })

    res.json({
      message: "Device summary retrieved successfully",
      data: {
        device,
        latestMoisture,
        latestCapture,
        moistureHistory,
      },
    })
  } catch (error) {
    next(error)
  }
}
