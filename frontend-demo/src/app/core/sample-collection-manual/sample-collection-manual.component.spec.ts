import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleCollectionManualComponent } from './sample-collection-manual.component';

describe('SampleCollectionManualComponent', () => {
  let component: SampleCollectionManualComponent;
  let fixture: ComponentFixture<SampleCollectionManualComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SampleCollectionManualComponent]
    });
    fixture = TestBed.createComponent(SampleCollectionManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
