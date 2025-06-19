const fs = require("fs")
const path = require("path")
const { analyzePlantImage } = require("./pythonBridgeService")

// Görsel dosyasının yolu
const imagePath = path.join(__dirname, "plant_image.jpg")  // Örnek görselin yolu

async function processImage() {
  try {
    // Flask sunucusuna görseli gönder ve sonucu al
    const result = await analyzePlantImage(imagePath)

    console.log("Gelen Sonuç:", result)

    if (result.error) {
      console.error("Hata:", result.error)
      return
    }

    // Segmentasyon sonucu işleme
    if (result.status === 204) {
      console.log("Bitki tespit edilmedi.")
    } else {
      console.log("Bitki tespit edildi!")
      console.log("Görsel:", result)  // Görselin başarılı şekilde gönderildiği sonuç
    }

  } catch (error) {
    console.error("Hata:", error.message)
  }
}

processImage()
