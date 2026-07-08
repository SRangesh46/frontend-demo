/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LandingHomeService } from './landing-home.service';

describe('Service: LandingHome', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LandingHomeService]
    });
  });

  it('should ...', inject([LandingHomeService], (service: LandingHomeService) => {
    expect(service).toBeTruthy();
  }));
});
