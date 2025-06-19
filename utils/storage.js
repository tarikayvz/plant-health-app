const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const STORAGE_DIR = path.join(__dirname, "../storage");

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Dosyayı depolama sistemine yükle
 * @param {Buffer} buffer - Dosya içeriği
 * @param {string} filename - Dosya adı
 * @returns {Promise<string>} - Dosya URL'si
 */
exports.uploadToStorage = async (buffer, filename) => {
  try {
    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${path.basename(filename)}`;
    const filePath = path.join(STORAGE_DIR, uniqueFilename);

    if (process.env.USE_S3 === "true") {
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: "image/jpeg",
      };
      await s3.upload(params).promise();
      return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    } else {
      await fs.promises.writeFile(filePath, buffer);
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      return `${baseUrl}/storage/${uniqueFilename}`;
    }
  } catch (error) {
    console.error("Error uploading file to storage:", error.message);
    throw error;
  }
};

/**
 * Dosyayı depolama sisteminden sil
 * @param {string} url - Dosya URL'si
 * @returns {Promise<boolean>} - Başarı durumu
 */
exports.deleteFromStorage = async (url) => {
  try {
    if (process.env.USE_S3 === "true") {
      const filename = url.split("/").pop();
      const params = { Bucket: process.env.S3_BUCKET, Key: filename };
      await s3.deleteObject(params).promise();
      return true;
    } else {
      const filename = url.split("/").pop();
      const filePath = path.join(STORAGE_DIR, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from storage:", error.message);
    return false;
  }
};