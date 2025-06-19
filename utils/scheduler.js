const cron = require("node-cron");
const plantHealthService = require("../services/plantHealthService");
const notificationService = require("../services/notificationService");
const { MoistureReading, Device, Plant, CameraCapture, HealthHistory, Notification } = require("../models");
const { Op } = require("sequelize");

cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled task: Process camera captures");
  await plantHealthService.processUnprocessedCaptures();
});

cron.schedule("*/15 * * * *", async () => {
  console.log("Running scheduled task: Process pending notifications");
  await notificationService.processPendingNotifications();
});

cron.schedule("0 */6 * * *", async () => {
  console.log("Running scheduled task: Check plants that need watering");

  try {
    const devices = await Device.findAll({
      where: { isActive: true },
      include: [{ model: Plant, attributes: ["id", "name", "currentMoisture", "lastWatered"] }],
    });

    for (const device of devices) {
      const latestReading = await MoistureReading.findOne({
        where: { deviceId: device.id },
        order: [["timestamp", "DESC"]],
      });

      if (latestReading && device.Plants && device.Plants.length > 0) {
        if (latestReading.moistureLevel < device.moistureThreshold) {
          for (const plant of device.Plants) {
            await plant.update({ currentMoisture: latestReading.moistureLevel });

            const lastNotification = await Notification.findOne({
              where: {
                relatedEntityId: plant.id,
                type: "moisture",
                timestamp: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              },
              order: [["timestamp", "DESC"]],
            });

            if (!lastNotification) {
              await notificationService.sendMoistureAlert(device.id, latestReading.moistureLevel);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking plants that need watering:", error.message);
  }
});

module.exports = {
  startScheduler: () => {
    console.log("Scheduler started");
  },
};