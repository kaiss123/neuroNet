import {Snake} from "./snake";
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

export class Population {

  private tensorflow = tf;
  private tensorflowVis = tfvis;

  snakes: Snake[] = [];
  snakeBest: Snake;
  snakeBestScore: number = 0;
  snakeMaxFruits: number = 0;
  snakeMaxFruitsHighScore: number = 0;
  snakePopulationScore: number = 0;
  snakeBestHighScore: number = 0;
  generation: number = 0;
  fitnessSum: number = 0;
  stop = false;
  size = 0;
  snakeId = 1;
  interval = 10;
  constructor(size: number = 2, interval) {
    this.size = size;
    this.interval = interval;
  }


  async start(fristRound: boolean = true) {
    this.generation++;
    if(fristRound) {
      this.snakes = [];
      for(let i = 1; i <= this.size; i++) {
        this.snakes.push(new Snake(this.snakeId++, this.interval));
      }
      this.snakeBest = this.snakes[0];
    } else {
      let tmpSnakes = this.naturalSelection();
      this.snakes = [];
      this.snakes = tmpSnakes;
      this.snakeBest = this.snakes[0];
    }

    this.snakeBest.replay = true;

    var done = await this.done(this.snakes);
    console.log('all dead!! -> calculateFitnessSum ->', this.calculateFitnessSum());
    if(!this.stop) {
      this.start(false);
    } else {
      console.log('stopped');
    }

  }

   async done(snakes): Promise<boolean[]> {
    return Promise.all(snakes.map(  async (s)=> await s.getStatus()));
  }

  naturalSelection() {
    this.calculateFitnessSum();
    return this.findBestSnakes();
  }

  findBestSnakes() {
    let sum = 0;
    let index = 1;
    let sortedSnakes = this.snakes.slice(0).sort((a,b) => b.fitness - a.fitness);
    while(sum < this.snakes.length-1) {
      sum += index;
      index++;
    }
    this.getBestSnake();
    let tmpsnakes = [];
    for(let i = 0; i < index; i++) {
      for(let j = i+1; j < index - i; j++) {
        tmpsnakes.push(this.crossover(sortedSnakes[i], sortedSnakes[j]));
      }
    }

    while(tmpsnakes.length < this.size) {
      let newSnake: Snake = new Snake(this.snakeId++, this.interval, sortedSnakes.shift().mind);
      tmpsnakes.push(newSnake);
    }
    console.table('new snake generation of', tmpsnakes);
    return tmpsnakes;
  }

  crossover(s1: Snake, s2:Snake) {
    if(s1 === undefined) {
      return new Snake(this.snakeId++, this.interval);
    }
    if(s2 === undefined) {
      return s1;
    }

    // s1.mind.summary();

    let newModel  = this.tensorflow.sequential();
    newModel.add(this.tensorflow.layers.dense({inputShape: [24], units: 1}));
    newModel.add(this.tensorflow.layers.dense({units: 24, activation: 'sigmoid'}));
    newModel.add(this.tensorflow.layers.dense({units: 24, activation: 'sigmoid'}));
    newModel.add(this.tensorflow.layers.dense({units: 4, useBias: true}));

    for(let i = 1; i < s1.mind.layers.length-1; i++) {
      let weight1 = s1.mind.layers[i].getWeights();
      let weight2 = s2.mind.layers[i].getWeights();

      let kernel1 = weight1[0].dataSync();
      let bias1 = weight1[1].dataSync();
      let kernel2 = weight2[0].dataSync();
      let bias2 = weight2[1].dataSync();

      const kernelSize = Math.ceil(kernel1.length / 2);
      let newKernel =  tf.tidy(() => {
        const a = kernel1.slice(0, kernelSize);
        const b = kernel2.slice(kernelSize, kernel1.length);
        let c = new Float32Array(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
      });
      const biasSize = Math.ceil(bias1.length / 2);
      let newBias =  tf.tidy(() => {
        const a = bias1.slice(0, biasSize);
        const b = bias2.slice(biasSize, bias1.length);

        let c = new Float32Array(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
      });

      // newModel = Object.assign({}, s1.mind);

      console.log('before', newModel.layers[i].getWeights()[0].dataSync());
      console.log('before', newModel.layers[i].getWeights()[1].dataSync());
      newModel.layers[i].setWeights([tf.tensor(newKernel, [1 + ((i-1) * 23), 24]), tf.tensor(newBias)]);
      console.log('after', newModel.layers[i].getWeights()[0].dataSync());
      console.log('after', newModel.layers[i].getWeights()[1].dataSync());
      // newModel.layers[1].setWeights([tf.tensor2d(myWeights1, shape=[1, myWeights1.length]), tf.tensor1d(myBias1)])
      // newModel.layers[2].setWeights([tf.tensor2d(myWeights2, shape=[myWeights2.length, 1]), tf.tensor1d(myBias2)])

      //newModel.layers[i].setWeights([newKernel, newBias]);

    }
    let child: Snake = new Snake(this.snakeId++, this.interval, newModel);
    //child.mind = newModel;

    return child;

  }

  getBestSnake() {
    this.snakeBestScore = Math.max(...this.snakes.map((s) => s.fitness));
    this.snakeMaxFruits = Math.max(...this.snakes.map((s) => s.score));
    let bestSnake = this.snakes.find(snake =>snake.fitness == this.snakeBestScore);

    if(this.snakeBestScore > this.snakeBestHighScore) {
      this.snakeBestHighScore = this.snakeBestScore;
    }
    if(this.snakeMaxFruits > this.snakeMaxFruitsHighScore) {
      this.snakeMaxFruitsHighScore = this.snakeMaxFruits;
    }
    //this.snakeBest = bestSnake;
    return bestSnake;
  }

  calculateFitnessSum(): number {  //calculate the sum of all the snakes fitnesses
    this.fitnessSum = 0;
    for(let i = 0; i < this.snakes.length; i++) {
      this.fitnessSum += this.snakes[i].fitness;
    }

    if(this.fitnessSum > this.snakePopulationScore) {
      this.snakePopulationScore = this.fitnessSum;
    }
    return this.fitnessSum;
  }
}
