import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {fromWorker} from "observable-webworker";

//https://github.com/nolanlawson/promise-worker
@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  worker;

  constructor() {
  }

  startWorker(data): Observable<any> {
    const input$: Observable<string> = of(data);

    return fromWorker<string, string>(() =>
      new Worker('./web-worker//naturalSelection.worker', { type: 'module'}), input$)
      // .subscribe(message => {
      //   console.log(`Got message`, message);
      //   cb(message);
      // });
  }

}
