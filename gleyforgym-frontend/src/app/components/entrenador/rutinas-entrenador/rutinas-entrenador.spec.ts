import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinasEntrenador } from './rutinas-entrenador';

describe('RutinasEntrenador', () => {
  let component: RutinasEntrenador;
  let fixture: ComponentFixture<RutinasEntrenador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinasEntrenador],
    }).compileComponents();

    fixture = TestBed.createComponent(RutinasEntrenador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
