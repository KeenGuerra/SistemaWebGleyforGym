import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PanelEntrenador } from './panel-entrenador';

describe('PanelEntrenador', () => {
  let component: PanelEntrenador;
  let fixture: ComponentFixture<PanelEntrenador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelEntrenador],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PanelEntrenador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
