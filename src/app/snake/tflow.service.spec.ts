import { TestBed } from '@angular/core/testing';

import { TflowService } from './tflow.service';

describe('TflowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TflowService = TestBed.get(TflowService);
    expect(service).toBeTruthy();
  });
});
