import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

export class NeuroNet {

  private tensorflow = tf;
  private tensorflowVis = tfvis;
  IMAGE_WIDTH = 28;
  IMAGE_HEIGHT = 28;
  IMAGE_CHANNELS = 1;

  private mind;

  constructor () {
    console.log('creating brain', new Date());
    this.mind = this.initBrain();
    this.mind.weights.forEach(w => {
      console.log(w.name, w.shape);
    });
    const a = tf.tensor([[1, 2], [3, 4]]);
    console.log('a shape:', a.shape);
    a.print();
  }

  public initBrain() {
    const model = this.tensorflow.sequential();
    model.add(this.tensorflow.layers.dense({inputShape: [8], units: 1, useBias: true}));
    model.add(tf.layers.dense({units: 24, activation: 'sigmoid'}));
    model.add(tf.layers.dense({units: 24, activation: 'sigmoid'}));
    model.add(this.tensorflow.layers.dense({units: 4, useBias: true}));

    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: tf.losses.meanSquaredError,
      metrics: ['accuracy'],
    });
    debugger;
    return model;
  }

  public think() {

  }
}
