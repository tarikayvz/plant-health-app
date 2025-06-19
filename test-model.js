const tf = require("@tensorflow/tfjs")
const fs = require("fs")
const path = require("path")


const MODEL_PATH = path.join(__dirname, "models/tfjs_model/model.json")
const CLASS_NAMES_PATH = path.join(__dirname, "models/class_names.json")


let classNames = []
try {
  const classNamesData = fs.readFileSync(CLASS_NAMES_PATH, "utf8")
  classNames = JSON.parse(classNamesData)
  console.log("Class names loaded:", classNames)
} catch (error) {
  console.error("Error loading class names:", error)
  classNames = ["healthy", "diseased", "dry", "yellow"]
}


const TEST_IMAGE_PATH = path.join(__dirname, "test-image.jpg")

async function testModel() {
  try {
    console.log("Loading model from:", MODEL_PATH)
    const model = await tf.loadLayersModel(`file://${MODEL_PATH}`)
    console.log("Model loaded successfully")

    
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.error("Test image not found:", TEST_IMAGE_PATH)
      return
    }

    const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH)
    const image = tf.node.decodeImage(imageBuffer)
    const resized = tf.image.resizeBilinear(image, [224, 224])
    const normalized = resized.div(255.0).expandDims(0)

    console.log("Running prediction...")
    const predictions = await model.predict(normalized).data()

   
    const classIndex = Array.from(predictions).indexOf(Math.max(...predictions))
    const predictedClass = classNames[classIndex]
    const confidence = Math.max(...predictions) * 100

    console.log("Prediction results:")
    console.log("- Predicted class:", predictedClass)
    console.log("- Confidence:", confidence.toFixed(2) + "%")

    
    console.log("\nAll class probabilities:")
    Array.from(predictions).forEach((prob, idx) => {
      console.log(`- ${classNames[idx]}: ${(prob * 100).toFixed(2)}%`)
    })

    
    tf.dispose([image, resized, normalized])
  } catch (error) {
    console.error("Error testing model:", error)
  }
}

testModel()
