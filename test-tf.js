const tf = require('@tensorflow/tfjs-node');

console.log('✅ TensorFlow versiyonu:', tf.version.tfjs);

const t = tf.tensor([1, 2, 3, 4]);
t.print(); 
