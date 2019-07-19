import {BOARD_SIZE, CONTROLS} from "./constants";
import {Fruit} from "./fruit";
import {NeuroNet} from "./neuroNet";

export class Snake extends NeuroNet{

  private interval: number = 150;
  private timer;
  public score = 0;;
  public lifeTime = 0;
  public lifeLeft = 200;
  public fitness = 0;
  public vision;

  direction = CONTROLS.LEFT;
  parts = [];
  public board = [];
  public fruit;
  public tempDirection: number = CONTROLS.LEFT;

  public replay;

  constructor(n = 0) {
    super();
    this.setBoard();
    this.start();
  }

  start() {
    for (let i = 0; i < 3; i++) {
      this.parts.push({x: 8 + i, y: 8});
    }
    this.fruit.resetFruit();
    this.updatePositions();
  }

  setBoard(): void {
    this.board = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = false;
      }
    }
    this.fruit = new Fruit(this.board);
  }

  eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.parts[this.parts.length - 1]);

    this.parts.push(tail);
    this.fruit.resetFruit();
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  boardCollision(part: any): boolean {
    return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
  }

  updatePositions(): void {
    let newHead = this.repositionHead();
    let me = this;

    if (this.boardCollision(newHead)) {
      return this.dead();
    }

    if (this.selfCollision(newHead)) {
      return this.dead();
    } else if (this.fruit.fruitCollision(newHead)) {
      this.eatFruit();
    }

    let oldTail = this.parts.pop();
    this.board[oldTail.y][oldTail.x] = false;

    this.parts.unshift(newHead);
    this.board[newHead.y][newHead.x] = true;

    this.lifeTime++;
    this.lifeLeft--;

    this.direction = this.tempDirection;
    if(this.replay) {
     // this.replaySub.next()
    }
    this.timer = setTimeout(() => {
      me.updatePositions();
    }, this.interval);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  dead() {
    clearTimeout(this.timer);
    console.log('dead');
  }

  calculateFitness() {
    if(this.score < 10) {
      this.fitness = Math.floor(this.lifeTime * this.lifeTime) * Math.pow(2, this.score);
    } else {
      this.fitness = Math.floor(this.lifeTime * this.lifeTime);
      this.fitness *= Math.pow(2,10);
      this.fitness *= (this.score-9);
    }
  }

  look() {
    this.vision = [];
    var tmp = this.lookInDirection({x: -BOARD_SIZE, y: 0});
    tmp = this.lookInDirection({x: -BOARD_SIZE, y: -BOARD_SIZE});
    tmp = this.lookInDirection({x: 0, y: -BOARD_SIZE});
    tmp = this.lookInDirection({x: BOARD_SIZE, y: -BOARD_SIZE});
    tmp = this.lookInDirection({x: BOARD_SIZE, y: 0});
    tmp = this.lookInDirection({x: BOARD_SIZE, y: BOARD_SIZE});
    tmp = this.lookInDirection({x: 0, y: BOARD_SIZE});
    tmp = this.lookInDirection({x: -BOARD_SIZE, y: BOARD_SIZE});
  }

  lookInDirection(directionVector) {
    var head = this.parts[0];

    var foodCollision: boolean = false;
    var bodyCollision: boolean = false;
    var wallCollision: boolean = false;
    var pos = head;

    while(this.boardCollision(head)) {

    }
  }
}
