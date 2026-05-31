import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgresoCliente } from './progreso-cliente';

describe('ProgresoCliente', () => {
  let component: ProgresoCliente;
  let fixture: ComponentFixture<ProgresoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgresoCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgresoCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
