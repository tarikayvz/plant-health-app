const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")

async function analyzePlantImage(imagePath) {
  try {
    const form = new FormData()
    form.append("image", fs.createReadStream(imagePath))

    const response = await axios.post("http://localhost:5001/analyze", form, {
      headers: form.getHeaders(),
    })

    return response.data // JSON olarak geliyor
  } catch (error) {
    console.error("Python sunucusuyla bağlantı hatası:", error.message)
    return { error: "Python sunucusuna erişilemedi" }
  }
}

module.exports = {
  analyzePlantImage,
}
