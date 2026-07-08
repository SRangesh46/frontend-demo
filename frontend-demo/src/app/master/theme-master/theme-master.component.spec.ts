import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeMasterComponent } from './theme-master.component';

describe('ThemeMasterComponent', () => {
  let component: ThemeMasterComponent;
  let fixture: ComponentFixture<ThemeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
