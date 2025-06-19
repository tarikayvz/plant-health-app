const fs = require("fs");
const path = require("path");
const { analyzePlantImage } = require("./pythonBridgeService");

const getTempPath = () => path.join(require("os").tmpdir(), `${Date.now()}.jpg`);

async function captureImage() {
  return new Promise((resolve, reject) => {
    const imagePath = getTempPath();
    // Örnek: Yerel bir test görüntüsü oluştur (gerçek kamera için OpenCV veya ffmpeg gerekebilir)
    fs.writeFile(imagePath, Buffer.from("Test Image Data"), (err) => {
      if (err) reject("Görüntü oluşturulamadı");
      else resolve(imagePath);
    });
    // Gerçek kamera için: exec(`ffmpeg -i /dev/video0 -frames:v 1 ${imagePath}`, ...)
  });
}

async function processCapturedImage() {
  try {
    const imagePath = await captureImage();
    const result = await analyzePlantImage(imagePath);
    fs.unlinkSync(imagePath);

    console.log("Sonuç:", result);
    if (result.error) console.error("Hata:", result.error);
    else console.log("Bitki Tespiti:", result);
  } catch (error) {
    console.error("Hata:", error.message);
  }
}

processCapturedImage();