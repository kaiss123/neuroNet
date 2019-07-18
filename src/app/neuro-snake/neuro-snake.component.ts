import {Component, OnInit} from '@angular/core';
import {Cell, CellValues, COLS, DIRECTIONS, Key, POINTS_PER_APPLE, ROWS, SNAKE_LENGTH, SPEED} from "./constants";
import {SnakeService} from "./snake/snake.service";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-neuro-snake',
  templateUrl: './neuro-snake.component.html',
  styleUrls: ['./neuro-snake.component.css']
})
export class NeuroSnakeComponent implements OnInit {

  public gameFieldMatrix: Cell[][];
  private blankField: Cell[][];
  public _ROWS = ROWS;
  constructor(public snakeService: SnakeService) {
    this.blankField = new Array(COLS)
      .fill(new Cell(0, 0))
      .map((item, y) => new Array(ROWS)
        .fill(new Cell(0, y))
        .map((e, x) => new Cell(x, y)));
    this.resetField();
  }

  ngOnInit() {
    this.snakeService.snakeLength$.subscribe(e => console.log(e));
    this.snakeService.game$
      .subscribe({
        next: (scene) => this.render(scene),
        //complete: () => renderGameOver(ctx)
      });
  }
  resetField() {
    this.gameFieldMatrix = this.blankField.map(e => e.slice());
  }

  render(scene) {
    // this.resetField();
    // this.renderSnake(scene.snake);
    // this.renderApples(scene.apples);
  }
  renderSnake(snake: Array<Cell>) {
    snake.forEach((segment, index) => this.paintCell(segment));
  }

  renderApples(apples: Array<Cell>) {
    apples.forEach((apple) => this.paintCell(apple));
  }

  paintCell(cell: Cell) {
    const x = cell.x;
    const y = cell.y;

    this.gameFieldMatrix[cell.x][cell.y].value = cell.value;
  }
}
