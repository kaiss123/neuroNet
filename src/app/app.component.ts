import { Component } from '@angular/core';
import {TensorflowService} from "./tensorflow.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'neuroNet';

  constructor(tensorService: TensorflowService) {
  }
}
