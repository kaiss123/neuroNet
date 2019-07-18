import {Injectable} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as exampleData from '../assets/MOCK_DATA.json';

@Injectable({
  providedIn: 'root'
})
export class TensorflowService {

  private tensorflow = tf;
  private tensorflowVis = tfvis;
  private data;

  private dummyData = exampleData;

  private testData;
  private config = {
    columnConfigs: {
      medv: {
        isLabel: true
      }
    }
  };

  constructor() {
    // this.init('https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv');
    // this.setupStuff();
  }

  private setupStuff() {
    const model = this.tensorflow.sequential();
    model.add(this.tensorflow.layers.dense({inputShape: [2], units: 1, useBias: true}));

    //model.add(tf.layers.dense({units: 20, activation: 'sigmoid'}));

    model.add(this.tensorflow.layers.dense({units: 1}));
  }

  public async start() {
    const model = this.createModel();
    this.tensorflowVis.show.modelSummary({name: 'Model Summary'}, model);

    const tensorData = this.convertToTensor(this.data);
    const {inputs, labels} = tensorData;

// Train the model
    await this.trainModel(model, inputs, labels);
    console.log('Done Training');

    this.testModel(model, this.data, tensorData);

  }
  public async init(dataUrl: string) {
    let csvDataset = this.tensorflow.data.csv(dataUrl, this.config);
    console.log('aasd11', csvDataset);
    this.testData = (await csvDataset.columnNames()).length - 1;
    console.log('aasd2', this.testData);

    this.data = await this.getData();
    const values = this.data.map(d => ({
      x: d.LAENGE,
      y: d.PROFILBREITE,
    }));
    this.tensorflowVis.render.scatterplot(
      {name: 'Horsepower v MPG'},
      {values},
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );
    await this.start();
  }

  async getData() {
    //const carsDataReq = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
    const carsDataReq = await this.tensorflow.data.csv('file://HaltungDummy.csv', this.config);
    //const carsData = await carsDataReq.json();
    const data = this.dummyData;
    const res = data['default'].map(dat => ({
      LAENGE: dat.LAENGE,
      PROFILBREITE: dat.PROFILBREITE,
    }))
      .filter(dat => (dat.LAENGE != null && dat.PROFILBREITE != null));

    return res;
  }

  createModel() {
    // Create a sequential model
    const model = this.tensorflow.sequential();

    // Add a single hidden layer
    model.add(this.tensorflow.layers.dense({inputShape: [1], units: 1, useBias: true}));
    model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
    // Add an output layer
    model.add(this.tensorflow.layers.dense({units: 1, useBias: true}));

    return model;
  }

  convertToTensor(data) {
    // Wrapping these calculations in a tidy will dispose any
    // intermediate tensors.

    return this.tensorflow.tidy(() => {
      // Step 1. Shuffle the data
      this.tensorflow.util.shuffle(data);

      // Step 2. Convert data to Tensor
      const inputs = data.map(d => d.LAENGE)
      const labels = data.map(d => d.PROFILBREITE);

      const inputTensor = this.tensorflow.tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = this.tensorflow.tensor2d(labels, [labels.length, 1]);

      //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }
    });
  }

  async trainModel(model, inputs, labels) {
    // Prepare the model for training.
    model.compile({
      optimizer: this.tensorflow.train.adam(),
      loss: this.tensorflow.losses.meanSquaredError,
      metrics: ['mse'],
    });

    const batchSize = 25;
    const epochs = 12;

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: this.tensorflowVis.show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse'],
        { height: 200, callbacks: ['onEpochEnd'] }
      )
    });
  }

  testModel(model, inputData, normalizationData) {
    const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling
    // that we did earlier.
    const [xs, preds] = tf.tidy(() => {

      const xs = tf.linspace(0, 1, 100);
      const preds = model.predict(xs.reshape([100, 1]));

      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);

      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);

      // Un-normalize the data
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });


    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });

    const originalPoints = inputData.map(d => ({
      x: d.LAENGE, y: d.PROFILBREITE,
    }));


    tfvis.render.scatterplot(
      {name: 'Model Predictions vs Original Data'},
      {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );
  }
}
