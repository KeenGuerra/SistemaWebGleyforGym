import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaEntrenador } from './asistencia-entrenador';

describe('AsistenciaEntrenador', () => {
  let component: AsistenciaEntrenador;
  let fixture: ComponentFixture<AsistenciaEntrenador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaEntrenador],
    }).compileComponents();

    fixture = TestBed.createComponent(AsistenciaEntrenador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
