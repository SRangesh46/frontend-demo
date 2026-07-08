import { TestBed } from '@angular/core/testing';

import { TestAlgorithmService } from './test-algorithm.service';

describe('TestAlgorithmService', () => {
  let service: TestAlgorithmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestAlgorithmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
