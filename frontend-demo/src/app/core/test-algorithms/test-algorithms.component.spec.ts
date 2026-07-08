/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestAlgorithmsComponent } from './test-algorithms.component';

describe('TestAlgorithmsComponent', () => {
  let component: TestAlgorithmsComponent;
  let fixture: ComponentFixture<TestAlgorithmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAlgorithmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAlgorithmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
