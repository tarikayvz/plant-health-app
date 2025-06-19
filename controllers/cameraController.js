const { CameraCapture, Device } = require("../models")
const plantHealthService = require("../services/plantHealthService")
const { uploadToStorage } = require("../utils/storage")

exports.uploadImage = async (req, res, next) => {
  try {
    const { deviceIdentifier } = req.body
    const imageFile = req.file

    if (!imageFile) {
      return res.status(400).json({ message: "No image file provided" })
    }

    const device = await Device.findOne({ where: { deviceIdentifier } })
    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    const imageUrl = await uploadToStorage(imageFile.buffer, `plants/${device.id}/${Date.now()}.jpg`)

    const capture = await CameraCapture.create({
      deviceId: device.id,
      imageUrl,
      timestamp: new Date(),
      processed: false,
    })

    setTimeout(async () => {
      try {
        const result = await plantHealthService.processCapture(capture.id, imageFile.buffer)
        await capture.update({
          healthStatus: result.label,
          confidence: result.prediction ? result.prediction * 100 : 0,
          processed: true,
        })
        console.log(`Processed image for device ${deviceIdentifier}: ${result.label} (${result.prediction * 100}%)`)
      } catch (error) {
        console.error("Error processing plant image:", error)
      }
    }, 0)

    res.status(201).json({
      message: "Image uploaded successfully",
      capture: {
        id: capture.id,
        imageUrl: capture.imageUrl,
        timestamp: capture.timestamp,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getLatestCapture = async (req, res, next) => {
  try {
    const { deviceId } = req.params

    // Authentication kontrolünü kaldırdık
    const device = await Device.findOne({
      where: { id: deviceId },
    })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    const capture = await CameraCapture.findOne({
      where: { deviceId },
      order: [["timestamp", "DESC"]],
    })

    if (!capture) {
      return res.status(404).json({ message: "No camera captures found for this device" })
    }

    res.status(200).json({
      message: "Latest camera capture retrieved successfully",
      capture,
    })
  } catch (error) {
    next(error)
  }
}

exports.getAllCaptures = async (req, res, next) => {
  try {
    const { deviceId } = req.params
    const { limit = 10, offset = 0 } = req.query

    // Authentication kontrolünü kaldırdık
    const device = await Device.findOne({
      where: { id: deviceId },
    })

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    const captures = await CameraCapture.findAndCountAll({
      where: { deviceId },
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["timestamp", "DESC"]],
    })

    res.status(200).json({
      message: "Camera captures retrieved successfully",
      count: captures.count,
      captures: captures.rows,
    })
  } catch (error) {
    next(error)
  }
}
