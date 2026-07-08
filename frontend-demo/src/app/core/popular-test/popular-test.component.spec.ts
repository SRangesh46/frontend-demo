import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularTestComponent } from './popular-test.component';

describe('PopularTestComponent', () => {
  let component: PopularTestComponent;
  let fixture: ComponentFixture<PopularTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopularTestComponent]
    });
    fixture = TestBed.createComponent(PopularTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
