const { Device, User, Plant } = require("../models")

exports.getAllDevices = async (req, res, next) => {
  try {
    const userId = req.user.id

    const devices = await Device.findAll({
      where: { userId },
      include: [
        {
          model: Plant,
          attributes: ["id", "name", "currentHealth", "currentMoisture"],
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
    
    const { name, deviceIdentifier, location, moistureThreshold, autoWatering } = req.body

    // Check if device already exists
    const existingDevice = await Device.findOne({ where: { deviceIdentifier } })
    if (existingDevice) {
      return res.status(400).json({ message: "Device with this identifier already exists" })
    }

    // Create new device
    const device = await Device.create({
      
      name,
      deviceIdentifier,
      location,
      moistureThreshold: moistureThreshold || 30,
      autoWatering: autoWatering || false,
      lastConnected: new Date(),
    })

    res.status(201).json({
      message: "Device created successfully",
      device,
    })
  } catch (error) {
    next(error)
  }
}

exports.getDeviceById = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const device = await Device.findOne({
      where: { id, userId },
      include: [
        {
          model: Plant,
          attributes: ["id", "name", "currentHealth", "currentMoisture", "imageUrl"],
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
    const userId = req.user.id
    const { id } = req.params
    const { name, location, moistureThreshold, autoWatering } = req.body

    const device = await Device.findOne({ where: { id, userId } })

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

    res.status(200).json({
      message: "Device updated successfully",
      device,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteDevice = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const device = await Device.findOne({ where: { id, userId } })

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
    const userId = req.user.id
    const { id } = req.params

    const device = await Device.findOne({ where: { id, userId } })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Update last connected timestamp
    await device.update({
      lastConnected: new Date(),
      isActive: true,
    })

    res.status(200).json({
      message: "Device connected successfully",
      device,
    })
  } catch (error) {
    next(error)
  }
}

exports.toggleAutoWatering = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const device = await Device.findOne({ where: { id, userId } })

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
    })
  } catch (error) {
    next(error)
  }
}

exports.updateMoistureThreshold = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { threshold } = req.body

    if (threshold === undefined || threshold < 0 || threshold > 100) {
      return res.status(400).json({ message: "Valid threshold value (0-100) is required" })
    }

    const device = await Device.findOne({ where: { id, userId } })

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
    })
  } catch (error) {
    next(error)
  }
}
