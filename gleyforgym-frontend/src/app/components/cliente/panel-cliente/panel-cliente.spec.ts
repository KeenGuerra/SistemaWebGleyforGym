import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PanelCliente } from './panel-cliente';

describe('PanelCliente', () => {
  let component: PanelCliente;
  let fixture: ComponentFixture<PanelCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelCliente],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PanelCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
