import tensorflow as tf
import tensorflowjs as tfjs


model = tf.keras.models.load_model('plant_classifier.h5')


tfjs.converters.save_keras_model(model, 'tfjs_model')

print("Model converted to TensorFlow.js format successfully!")
