import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NeuroSnakeComponent } from './neuro-snake/neuro-snake.component';
import { SnakeComponent } from './snake/snake.component';
import {WorkerService} from "./snake/worker/worker.service";

@NgModule({
  declarations: [
    AppComponent,
    NeuroSnakeComponent,
    SnakeComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [WorkerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
