import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ClientesAsignados } from './clientes-asignados';

describe('ClientesAsignados', () => {
  let component: ClientesAsignados;
  let fixture: ComponentFixture<ClientesAsignados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesAsignados],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesAsignados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
