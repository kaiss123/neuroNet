import { Injectable } from '@angular/core';
import {Cell, DIRECTIONS, FPS, Key, POINTS_PER_APPLE, SNAKE_LENGTH, SPEED} from "../constants";
import {BehaviorSubject, combineLatest, fromEvent, interval, Observable} from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  share,
  skip,
  startWith,
  takeWhile,
  tap,
  withLatestFrom
} from "rxjs/operators";
import {eat, generateApples, generateSnake, isGameOver, move, nextDirection} from "../utils";
import {animationFrame} from "rxjs/internal/scheduler/animationFrame";

@Injectable({
  providedIn: 'root'
})
export class SnakeService {

  constructor() { }

  INITIAL_DIRECTION = DIRECTIONS[Key.DOWN];
  ticks$ = interval(SPEED);
  click$ = fromEvent(document, 'click');
  keydown$ = fromEvent(document, 'keydown');
  direction$ = this.keydown$
    .pipe(map((event: KeyboardEvent) => DIRECTIONS[event.keyCode]))
    .pipe(filter(direction => !!direction))
    .pipe(scan(nextDirection))
    .pipe(startWith(this.INITIAL_DIRECTION))
    .pipe(distinctUntilChanged());
  length$ = new BehaviorSubject<number>(SNAKE_LENGTH);
  snakeLength$ = this.length$
    .pipe(scan((step, snakeLength) => snakeLength + step))
    .pipe(share());
  score$ = this.snakeLength$
    .pipe(startWith(0))
    .pipe(scan((score, _) => score + POINTS_PER_APPLE));
  snake$: Observable<Array<Cell>> = this.ticks$
    .pipe(withLatestFrom(this.direction$, this.snakeLength$, (_, direction, snakeLength) => [direction, snakeLength]))
    .pipe(scan(move, generateSnake()))
    .pipe(share());
  apples$ = this.snake$
    .pipe(scan(eat, generateApples()))
    .pipe(distinctUntilChanged())
    .pipe(share());
  appleEaten$ = this.apples$
    .pipe(skip(1))
    .pipe(tap(() => {
      this.length$.next(POINTS_PER_APPLE);
    }))
    .subscribe();
  scene$ = combineLatest(this.snake$, this.apples$, this.score$, (snake, apples, score) => ({ snake, apples, score }));
  game$ = interval(1000 / FPS, animationFrame)
    .pipe(withLatestFrom(this.scene$, (_, scene) => scene))
    .pipe(takeWhile(scene => !isGameOver(scene)));
}
