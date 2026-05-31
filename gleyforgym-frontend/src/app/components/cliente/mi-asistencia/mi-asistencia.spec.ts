import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiAsistencia } from './mi-asistencia';

describe('MiAsistencia', () => {
  let component: MiAsistencia;
  let fixture: ComponentFixture<MiAsistencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiAsistencia],
    }).compileComponents();

    fixture = TestBed.createComponent(MiAsistencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
