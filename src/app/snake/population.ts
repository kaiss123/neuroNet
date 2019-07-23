import {Snake} from "./snake";
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import {NeuroNet} from "./neuroNet";
import {first} from "rxjs/operators";
import {clone} from "@tensorflow/tfjs";

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
   this.snakes.map((s)=> s.start());

    var done = await this.done(this.snakes);
    console.log('all dead!! -> calculateFitnessSum ->', this.calculateFitnessSum());
    this.showCharts();
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
    let index = 1;
    let bestLastGen = this.getBestSnake();


    // //let tmpsnakes = [new Snake(this.snakeId++, this.interval, bestLastGen.mind)];
    // let tmpsnakes = [];

    //
    // while(tmpsnakes.length < this.size) {
    //   let ran = Math.random() * this.size / 4;
    //   let child = this.crossover(sortedSnakes.shift(), new Snake(this.snakeId++, this.interval));
    //   this.mutate(child);
    //   tmpsnakes.push(child);
    // }

    // let sum = 0;
    // while(sum < this.snakes.length-1) {
    //   sum += index;
    //   index++;
    // }

    let tmpsnakes = [];
    let tmp1 = 0;
    for(let i = 0; i < this.snakes.length; i++) {
      tmp1 += this.snakes[i].fitness;
    }
    let avgSnakeFitness = tmp1 / this.snakes.length;

    console.log( tmp1 / this.snakes.length);


    // let sortedByAvg = this.snakes.sort((a,b) => b.fitness - a.fitness)
    //   .filter(s => s.fitness < avgSnakeFitness);
    // for(let i = 0; i < sortedByAvg.length; i++) {
    //   if(sortedByAvg[i+1] !== undefined) {
    //      tmpsnakes.push(this.crossover(sortedByAvg[i], sortedByAvg[i+1]));
    //   }
    // }
    while(tmpsnakes.length < this.size) {
      tmpsnakes.push(this.crossover(this.selectParent(), this.selectParent()));
    }
    // for(let i = 0; i < this.snakes.length-1; i++) {
    //   tmpsnakes.push(this.crossover(this.snakes[i], new Snake(this.snakeId++, this.interval)));
    // }
   // let sortedSnakes = tmpsnakes.sort((a,b) => a.parentsFitness - b.parentsFitness).slice(0, this.size);
    //console.table(sortedSnakes);
    // let tmp = 0;
    // for(let i = 0; i < sortedSnakes.length; i++) {
    //   tmp += sortedSnakes[i].fitness;
    // }
    // console.log( tmp / sortedSnakes.length);
    // console.log();

    // while(tmpsnakes.length < this.size) {
    //   let newSnakeA: Snake = new Snake(this.snakeId++, this.interval, sortedSnakes.shift().mind);
    //   tmpsnakes.push(this.crossover(newSnakeA, new Snake(this.snakeId++, this.interval)));
    // }

    console.table('new snake generation of', tmpsnakes);
    return tmpsnakes;
  }

  selectParent(): Snake {
    let sum = 0;
    let randByFitSum = Math.random() * this.fitnessSum;
    let parent;
    let found = false;
    for(let i = 0; i < this.size; i++) {
      sum += this.snakes[i].fitness;
      if(sum > randByFitSum && !found) {
        parent = this.snakes[i];
        found = true;
      }
    }
    return parent;
  }
  crossover(s1: Snake, s2:Snake) {
    // if(s1 === undefined) {
    //   return new Snake(this.snakeId++, this.interval);
    // }
    // if(s2 === undefined) {
    //   return s1;
    // }

    // s1.mind.summary();
    let newModel = NeuroNet.initBrain();
    // let newModel  = this.tensorflow.sequential();
    // newModel.add(this.tensorflow.layers.dense({inputShape: [24], units: 1}));
    // newModel.add(this.tensorflow.layers.dense({units: 24, activation: 'sigmoid'}));
    // newModel.add(this.tensorflow.layers.dense({units: 24, activation: 'sigmoid'}));
    // newModel.add(this.tensorflow.layers.dense({units: 4, useBias: true}));

    console.table('before s1', s1.id, s1.mind.layers[1].getWeights()[1].dataSync());
    console.table('before s2', s2.id, s2.mind.layers[1].getWeights()[1].dataSync());

    for(let i = 1; i < s1.mind.layers.length-1; i++) {
      let weight1 = s1.mind.layers[i].getWeights();
      let weight2 = s2.mind.layers[i].getWeights();

      let kernel1 = weight1[0].dataSync();
      let bias1 = weight1[1].dataSync();
      let kernel2 = weight2[0].dataSync();
      let bias2 = weight2[1].dataSync();

      const kernelSize = Math.ceil(kernel1.length / 2);
      let newKernel =  tf.tidy(() => {
        let multi = kernel1.map((w, i) => {
          // return (w * 2 + kernel2[i]) / 3;
          let rand = Math.random();
          let value = (rand > 0.5) ? w : kernel2[i];
          return this.mutate(value);
        });

        const a = kernel1.slice(0, kernelSize);
        const b = kernel2.slice(kernelSize, kernel1.length);
        //let c = new Float32Array(a.length + b.length);

        let c = new Float32Array(kernel1.length );
        c.set(multi);
        // c.set(b, a.length);
        return c;
      });

      const biasSize = Math.ceil(bias1.length / (Math.random() * bias1.length));
      let newBias =  tf.tidy(() => {
        let multi = bias1.map((w, i) => {
          //return (w * 2 + bias2[i])/ 3;
          let rand = Math.random()
          return (rand > 0.5) ? w : bias2[i];
        });
        const a = bias1.slice(0, biasSize);
        const b = bias2.slice(biasSize, bias1.length);

        let c = new Float32Array(bias1.length );
        c.set(multi);
        // c.set(b, a.length);
        return c;
      });

      // newModel = Object.assign({}, s1.mind);

      //console.log('before', newModel.layers[i].getWeights()[0].dataSync());
      newModel.layers[i].setWeights([tf.tensor(newKernel, [1 + ((i-1) * 23), 24]), tf.tensor(newBias)]);
      //console.log('after', newModel.layers[i].getWeights()[0].dataSync());
      // newModel.layers[1].setWeights([tf.tensor2d(myWeights1, shape=[1, myWeights1.length]), tf.tensor1d(myBias1)])
      // newModel.layers[2].setWeights([tf.tensor2d(myWeights2, shape=[myWeights2.length, 1]), tf.tensor1d(myBias2)])

      //newModel.layers[i].setWeights([newKernel, newBias]);
    }

    //console.log('after', newModel.layers[1].getWeights()[1].dataSync());
    let child: Snake = new Snake(this.snakeId++, this.interval, newModel, s1.fitness * s2.fitness);
    //child.mind = newModel;

    return child;

  }

  mutate(weight, mutationRate = 0.4){

    // let rand = Math.random();
    // if (rand<mutationRate) {//if chosen to be mutated
    //   if(Math.round(Math.random())) {
    //     let test = this.gaussianRandom(0)/5;
    //     weight += test;
    //     if (weight>1) {
    //       return 1;
    //     }
    //     if (weight <-1) {
    //       return -1;
    //     }
    //   }
    // }
    return weight
  }

  gaussianRandom(x) {
    return Math.pow(Math.E,-Math.pow(x,2)/2)/Math.sqrt(2*Math.PI);
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
    this.chartDataFitness.push({x: this.generation, y: this.snakeBestScore})
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
    this.chartData.push({x: this.generation, y: this.fitnessSum / this.size});
    return this.fitnessSum;
  }

  chartData = [];
  showCharts() {
    this.showChartFitness();
    let values = this.chartData.map(d => ({
      x: d.x,
      y: d.y,
    }));

    this.tensorflowVis.render.linechart(
      {name: 'Fittness Sum per Generation'},
      {values},
      {
        xLabel: 'Generation',
        yLabel: 'Fitness of all',
        height: 300
      }
    );
  }
  chartDataFitness = [];
  showChartFitness() {
    let values = this.chartDataFitness.map(d => ({
      x: d.x,
      y: d.y,
    }));

    this.tensorflowVis.render.linechart(
      {name: 'Fittness Sum per Individual'},
      {values},
      {
        xLabel: 'Generation',
        yLabel: 'Fitness of all',
        height: 300
      }
    );
  }
}
