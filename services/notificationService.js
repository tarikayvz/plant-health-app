const { User, Notification, Device, Plant, MoistureReading, HealthHistory } = require("../models");
const admin = require("./firebaseAdmin");
const { Op } = require("sequelize");

exports.sendPushNotification = async (userId, title, message, data = {}) => {
  try {
    const user = await User.findByPk(userId, { attributes: ["id", "fcmToken"] });
    if (!user || !user.fcmToken) {
      console.log(`No FCM token found for user ${userId}`);
      return false;
    }

    const payload = {
      notification: { title, body: message },
      data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
    };

    await admin.messaging().sendToDevice(user.fcmToken, payload);
    await Notification.create({
      userId,
      title,
      message,
      type: data.type || "system",
      relatedEntityType: data.entityType,
      relatedEntityId: data.entityId,
      actionRequired: data.actionRequired || false,
      actionType: data.actionType,
    });
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error.message);
    return false;
  }
};

exports.sendMoistureAlert = async (deviceId, moistureLevel) => {
  try {
    const device = await Device.findByPk(deviceId, {
      include: [{ model: Plant, attributes: ["id", "name"] }, { model: User, attributes: ["id"] }],
    });
    if (!device || !device.User) return false;

    if (moistureLevel > device.moistureThreshold) return false;

    const plantName = device.Plants?.[0]?.name || "Bitkiniz";
    const title = `${plantName} Sulanma Zamanı`;
    const message = `${plantName} için nem seviyesi düşük (${moistureLevel}%). Sulama gerekiyor.`;

    return await exports.sendPushNotification(device.User.id, title, message, {
      type: "moisture",
      entityType: "Plant",
      entityId: device.Plants?.[0]?.id,
      actionRequired: true,
      actionType: "water",
      moistureLevel: moistureLevel.toString(),
      deviceId,
    });
  } catch (error) {
    console.error("Error sending moisture alert:", error.message);
    return false;
  }
};

exports.sendHealthAlert = async (plantId, healthStatus, confidence) => {
  try {
    const plant = await Plant.findByPk(plantId, { include: [{ model: User, attributes: ["id"] }] });
    if (!plant || !plant.User) return false;

    let title, message, actionType;
    switch (healthStatus) {
      case "diseased":
        title = `${plant.name} Hastalandı`;
        message = `${plant.name} bitkisinde hastalık var. Kontrol edin.`;
        actionType = "treat";
        break;
      case "dry":
        title = `${plant.name} Kuruyor`;
        message = `${plant.name} kuruma belirtileri gösteriyor. Sulayın.`;
        actionType = "water";
        break;
      case "yellow":
        title = `${plant.name} Sararıyor`;
        message = `${plant.name} yaprakları sararıyor. Besin kontrolü yapın.`;
        actionType = "fertilize";
        break;
      default:
        return false;
    }

    return await exports.sendPushNotification(plant.User.id, title, message, {
      type: "health",
      entityType: "Plant",
      entityId: plant.id,
      actionRequired: true,
      actionType,
      healthStatus,
      confidence: confidence.toString(),
    });
  } catch (error) {
    console.error("Error sending health alert:", error.message);
    return false;
  }
};

exports.processPendingNotifications = async () => {
  try {
    const moistureReadings = await MoistureReading.findAll({
      where: { notificationSent: false, timestamp: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      include: [{ model: Device, attributes: ["id", "moistureThreshold", "userId"] }],
    });

    for (const reading of moistureReadings) {
      if (reading.moistureLevel < reading.Device.moistureThreshold) {
        await exports.sendMoistureAlert(reading.deviceId, reading.moistureLevel);
        await reading.update({ notificationSent: true });
      }
    }

    const healthRecords = await HealthHistory.findAll({
      where: { notificationSent: false, healthStatus: { [Op.ne]: "healthy" }, timestamp: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      include: [{ model: Plant, attributes: ["id", "name", "userId"] }],
    });

    for (const record of healthRecords) {
      await exports.sendHealthAlert(record.plantId, record.healthStatus, record.confidence);
      await record.update({ notificationSent: true });
    }
  } catch (error) {
    console.error("Error processing pending notifications:", error.message);
  }
};