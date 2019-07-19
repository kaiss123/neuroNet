import {Snake} from "./snake";
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

export class Population {

  private tensorflow = tf;
  private tensorflowVis = tfvis;

  snakes: Snake[] = [];
  snakeBest: Snake;
  generation: number = 0;

  constructor(size: number = 10) {

    this.snakes;
    for(let i = 0; i <= size; i++) {
      this.snakes.push(new Snake());
    }
    this.snakeBest = this.snakes[0];
    this.snakeBest.replay = true;
  }

}
