import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeuroSnakeComponent } from './neuro-snake.component';

describe('NeuroSnakeComponent', () => {
  let component: NeuroSnakeComponent;
  let fixture: ComponentFixture<NeuroSnakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeuroSnakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeuroSnakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
