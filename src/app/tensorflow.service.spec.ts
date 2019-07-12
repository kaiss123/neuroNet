import { TestBed } from '@angular/core/testing';

import { TensorflowService } from './tensorflow.service';

describe('TensorflowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TensorflowService = TestBed.get(TensorflowService);
    expect(service).toBeTruthy();
  });
});
