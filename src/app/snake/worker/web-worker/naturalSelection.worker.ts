import {DoWork, ObservableWorker} from "observable-webworker";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Snake} from "../../snake";
import {NeuroNet} from "../../neuroNet";
import * as tf from "@tensorflow/tfjs";

@ObservableWorker()
export class NaturalSelectionWorker implements DoWork<Snake[], Snake[]> {

  snakes: Snake[] = [];
  snakeBestScore: number = 0;
  snakeMaxFruits: number = 0;
  snakeMaxFruitsHighScore: number = 0;
  snakePopulationScore: number = 0;
  snakeBestHighScore: number = 0;
  generation: number = 0;
  fitnessSum: number = 0;
  stop = false;
  size = 20;
  snakeId = 1;
  interval = 10;
  chartData = [];
  chartDataFitness = [];

  public work(input$: Observable<Snake[]>): Observable<Snake[]> {
    tf.setBackend('cpu');
    return input$.pipe(
      map(data => {
        return this.naturalSelection(data);
      })
    )
  }

  naturalSelection(data) {
    this.snakes = data;
    this.calculateFitnessSum();
    return this.findBestSnakes();
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

  findBestSnakes() {
    let tmpsnakes = [];
    let tmp1 = 0;
    for(let i = 0; i < this.snakes.length; i++) {
      tmp1 += this.snakes[i].fitness;
    }
    let avgSnakeFitness = tmp1 / this.snakes.length;

    console.log( tmp1 / this.snakes.length);
    while(tmpsnakes.length < this.size) {
      tmpsnakes.push(this.crossover(this.selectParent(), new Snake(this.snakeId++, this.interval)));
    }
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
    let newModel = NeuroNet.initBrain();

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
      newModel.layers[i].setWeights([tf.tensor(newKernel, [1 + ((i-1) * 23), 24]), tf.tensor(newBias)]);

    }
    let child: Snake = new Snake(this.snakeId++, this.interval, newModel, s1.fitness * s2.fitness);
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
}
