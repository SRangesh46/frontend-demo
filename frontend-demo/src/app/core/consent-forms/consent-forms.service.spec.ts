import { TestBed } from '@angular/core/testing';

import { ConsentFormsService } from './consent-forms.service';

describe('ConsentFormsService', () => {
  let service: ConsentFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsentFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
