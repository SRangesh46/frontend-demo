import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularPackageComponent } from './popular-package.component';

describe('PopularPackageComponent', () => {
  let component: PopularPackageComponent;
  let fixture: ComponentFixture<PopularPackageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopularPackageComponent]
    });
    fixture = TestBed.createComponent(PopularPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
