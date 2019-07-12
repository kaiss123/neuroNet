import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class TensorflowService {

  private tensorflow = tf;

  private testData;
  private config = {
    columnConfigs: {
      medv: {
        isLabel: true
      }
    }};

  constructor() {
    this.init('https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv');
  }

  public async init(dataUrl: string) {
    this.testData = await this.tensorflow.data.csv(dataUrl, this.config);
    console.log(this.testData);
    debugger;
  }
}
