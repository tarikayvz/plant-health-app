const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { analyzePlantImage } = require("./pythonBridgeService");
const { CameraCapture, Plant, HealthHistory, Device } = require("../models");
const notificationService = require("./notificationService");
const axios = require("axios");

const getTempPath = () => path.join(require("os").tmpdir(), `${Date.now()}.jpg`);

/**
 * Flask sunucusunun hazır olup olmadığını kontrol eder.
 */
async function isModelReady() {
  try {
    const response = await axios.get("http://localhost:5001/health");
    return response.status === 200;
  } catch (err) {
    console.error("Flask sağlık kontrolü hatası:", err.message);
    return false;
  }
}

/**
 * Görüntüden bitki sağlığını analiz eder.
 * @param {Buffer} imageBuffer - Analiz edilecek görüntü verisi
 * @returns {Promise<Object>} - Analiz sonucu
 */
async function detectPlantHealth(imageBuffer) {
  const tempPath = getTempPath();
  fs.writeFileSync(tempPath, imageBuffer);
  const result = await analyzePlantImage(tempPath);
  fs.unlinkSync(tempPath);
  return result;
}

/**
 * Kamera yakalaması işler (manuel veya otomatik).
 * @param {number|string} captureId - Yakalama kimliği
 * @param {Buffer} imageBuffer - Görüntü verisi
 * @returns {Promise<Object>} - Analiz sonucu
 */
async function processCapture(captureId, imageBuffer) {
  const tempPath = getTempPath();
  fs.writeFileSync(tempPath, imageBuffer);
  const result = await analyzePlantImage(tempPath);
  fs.unlinkSync(tempPath);
  return result;
}

/**
 * İşlenmemiş kamera yakalamalarını işler ve bitki sağlığını günceller.
 * @returns {Promise<void>}
 */
async function processUnprocessedCaptures() {
  try {
    const unprocessedCaptures = await CameraCapture.findAll({
      where: { processed: false },
      include: [
        {
          model: Device,
          include: [{ model: Plant }],
        },
      ],
    });

    console.log(`Processing ${unprocessedCaptures.length} unprocessed captures`);

    for (const capture of unprocessedCaptures) {
      try {
        const imageResponse = await fetch(capture.imageUrl);
        if (!imageResponse.ok) throw new Error("Görsel indirilemedi");
        const imageBuffer = await imageResponse.buffer();

        const result = await processCapture(capture.id, imageBuffer);
        console.log("Gelen sonuç:", result);

        await capture.update({
          healthStatus: result.label || "unknown",
          confidence: result.prediction ? result.prediction * 100 : 0,
          processed: true,
        });

        if (
          result.prediction &&
          result.prediction * 100 > 70 &&
          capture.Device &&
          capture.Device.Plants &&
          capture.Device.Plants.length > 0
        ) {
          for (const plant of capture.Device.Plants) {
            await plant.update({ currentHealth: result.label });

            await HealthHistory.create({
              plantId: plant.id,
              healthStatus: result.label,
              imageUrl: capture.imageUrl,
              confidence: result.prediction * 100,
            });

            if (result.label !== "Healthy") {
              await notificationService.sendHealthAlert(
                plant.id,
                result.label,
                result.prediction * 100
              );
            }
          }
        }
      } catch (captureError) {
        console.error(`Error processing capture ${capture.id}:`, captureError.message);
        await capture.update({ processed: true });
      }
    }
  } catch (error) {
    console.error("Error processing unprocessed captures:", error.message);
  }
}

module.exports = {
  processUnprocessedCaptures,
  isModelReady,
  detectPlantHealth,
  processCapture,
};