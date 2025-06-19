const { Device, User, Plant } = require("../models")

exports.getAllDevices = async (req, res, next) => {
  try {
    // userId kontrolünü kaldırdık - tüm cihazları getir
    const devices = await Device.findAll({
      include: [
        {
          model: Plant,
          attributes: ["id", "name", "currentHealth", "currentMoisture"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"], // User bilgilerini de dahil et
        },
      ],
    })

    res.status(200).json({
      message: "Devices retrieved successfully",
      devices,
    })
  } catch (error) {
    next(error)
  }
}

exports.createDevice = async (req, res, next) => {
  try {
    const { name, deviceIdentifier, location, moistureThreshold, autoWatering, userId } = req.body

    // userId'yi body'den al veya default değer ver
    const deviceUserId = userId || 1 // Default olarak user ID 1 kullan

    // Check if device already exists
    const existingDevice = await Device.findOne({ where: { deviceIdentifier } })
    if (existingDevice) {
      return res.status(400).json({ message: "Device with this identifier already exists" })
    }

    // Create new device
    const device = await Device.create({
      userId: deviceUserId,
      name,
      deviceIdentifier,
      location,
      moistureThreshold: moistureThreshold || 30,
      autoWatering: autoWatering || false,
      lastConnected: new Date(),
    })

    // Created device'ı user bilgisi ile birlikte döndür
    const deviceWithUser = await Device.findOne({
      where: { id: device.id },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    })

    res.status(201).json({
      message: "Device created successfully",
      device: deviceWithUser,
    })
  } catch (error) {
    next(error)
  }
}

exports.getDeviceById = async (req, res, next) => {
  try {
    const { id } = req.params

    const device = await Device.findOne({
      where: { id },
      include: [
        {
          model: Plant,
          attributes: ["id", "name", "currentHealth", "currentMoisture", "imageUrl"],
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

    res.status(200).json({
      message: "Device retrieved successfully",
      device,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateDevice = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, location, moistureThreshold, autoWatering } = req.body

    const device = await Device.findOne({ where: { id } })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Update device
    await device.update({
      name: name || device.name,
      location: location || device.location,
      moistureThreshold: moistureThreshold !== undefined ? moistureThreshold : device.moistureThreshold,
      autoWatering: autoWatering !== undefined ? autoWatering : device.autoWatering,
    })

    // Updated device'ı user bilgisi ile birlikte döndür
    const updatedDeviceWithUser = await Device.findOne({
      where: { id: device.id },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    })

    res.status(200).json({
      message: "Device updated successfully",
      device: updatedDeviceWithUser,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteDevice = async (req, res, next) => {
  try {
    const { id } = req.params

    const device = await Device.findOne({ where: { id } })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Delete device
    await device.destroy()

    res.status(200).json({
      message: "Device deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

exports.connectDevice = async (req, res, next) => {
  try {
    const { id } = req.params

    const device = await Device.findOne({ where: { id } })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Update last connected timestamp
    await device.update({
      lastConnected: new Date(),
      isActive: true,
    })

    // Connected device'ı user bilgisi ile birlikte döndür
    const connectedDeviceWithUser = await Device.findOne({
      where: { id: device.id },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    })

    res.status(200).json({
      message: "Device connected successfully",
      device: connectedDeviceWithUser,
    })
  } catch (error) {
    next(error)
  }
}

exports.toggleAutoWatering = async (req, res, next) => {
  try {
    const { id } = req.params

    const device = await Device.findOne({ where: { id } })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Toggle auto watering
    await device.update({
      autoWatering: !device.autoWatering,
    })

    res.status(200).json({
      message: `Auto watering ${device.autoWatering ? "enabled" : "disabled"} successfully`,
      autoWatering: device.autoWatering,
      deviceId: device.id,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateMoistureThreshold = async (req, res, next) => {
  try {
    const { id } = req.params
    const { threshold } = req.body

    if (threshold === undefined || threshold < 0 || threshold > 100) {
      return res.status(400).json({ message: "Valid threshold value (0-100) is required" })
    }

    const device = await Device.findOne({ where: { id } })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Update moisture threshold
    await device.update({
      moistureThreshold: threshold,
    })

    res.status(200).json({
      message: "Moisture threshold updated successfully",
      moistureThreshold: device.moistureThreshold,
      deviceId: device.id,
    })
  } catch (error) {
    next(error)
  }
}
