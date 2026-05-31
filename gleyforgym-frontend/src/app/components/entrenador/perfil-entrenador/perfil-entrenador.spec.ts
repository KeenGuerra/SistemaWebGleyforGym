import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilEntrenador } from './perfil-entrenador';

describe('PerfilEntrenador', () => {
  let component: PerfilEntrenador;
  let fixture: ComponentFixture<PerfilEntrenador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEntrenador],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilEntrenador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
