import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

// http://www.curiousinspiration.com/posts/tensors,-the-building-block-for-deep-learning

export class NeuroNet {

  private tensorflow = tf;
  private tensorflowVis = tfvis;

  public mind;

  constructor (generatedMind) {
    if(generatedMind) {
      this.mind = generatedMind;
    }else {
      this.mind = this.initBrain();
    }

    // this.mind.weights.forEach(w => {
    //   console.log(w.name, w.shape);
    // });
  }

  public initBrain() {
    const model = this.tensorflow.sequential();
    model.add(this.tensorflow.layers.dense({inputShape: [24], units: 1}));
    model.add(this.tensorflow.layers.dense({units: 24, activation: 'sigmoid'}));
    model.add(this.tensorflow.layers.dense({units: 24, activation: 'sigmoid'}));
    model.add(this.tensorflow.layers.dense({units: 4}));

    // const optimizer = tf.train.adam();
    // model.compile({
    //   optimizer: optimizer,
    //   loss: tf.losses.meanSquaredError,
    //   metrics: ['accuracy'],
    // });
    // debugger;
    // model.predict(tf.tensor2d([2,1],[2,1]));
    // console.log(model);
    // kernel:
    //model.layers[2].getWeights()[0].print()

// bias:
    //console.log('-----------')
    //model.layers[2].getWeights()[1].print()
    return model;
  }

  public async decide(input) {
    //console.log('input: ', input);
    return this.tensorflow.tidy(() => {
      return this.mind.predict(this.tensorflow.tensor([input]));
    });
  }
}
