import {Injectable} from '@angular/core';

//https://github.com/nolanlawson/promise-worker
@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  worker;

  constructor() {
    this.init();
  }

  init(): void {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker('./web-worker//worker.worker', { type: 'module' });
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage('hello');
      // worker.onmessage = ({data}) => this.onMessage(data);
    } else {
     console.error('no Web Worker Tecmologi installed at your shitty computer o_O')
    }
  }

  onMessage(data) {
    console.log(`page got message: ${data}`);
    this.doFencyStuff();
  }

  doFencyStuff() {

   // worker.postMessage('hello');
  }
}
