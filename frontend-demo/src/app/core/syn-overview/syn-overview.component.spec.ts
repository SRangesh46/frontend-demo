import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynOverviewComponent } from './syn-overview.component';

describe('SynOverviewComponent', () => {
  let component: SynOverviewComponent;
  let fixture: ComponentFixture<SynOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SynOverviewComponent]
    });
    fixture = TestBed.createComponent(SynOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
