import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelMasterComponent } from './label-master.component';

describe('LabelMasterComponent', () => {
  let component: LabelMasterComponent;
  let fixture: ComponentFixture<LabelMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabelMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
