import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProgresoCliente } from './progreso-cliente';

describe('ProgresoCliente', () => {
  let component: ProgresoCliente;
  let fixture: ComponentFixture<ProgresoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgresoCliente],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgresoCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
