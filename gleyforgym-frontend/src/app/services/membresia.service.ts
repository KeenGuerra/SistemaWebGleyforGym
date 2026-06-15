import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Membresia } from '../models/membresia';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/membresias';

  private _membresias = signal<Membresia[]>([]);

  readonly membresias = this._membresias.asReadonly();

  readonly membresiaActiva = computed(() =>
    this._membresias().find(m => m.clienteId === 5 && m.estado === 'ACTIVA')
  );

  private mapToMembresia(cm: any): Membresia {
    return {
      id: cm.id,
      clienteId: cm.cliente_id,
      tipo: cm.membresia?.nombre || 'Mensual Premium',
      precio: cm.membresia ? +cm.membresia.precio : 2500,
      fechaInicio: cm.fecha_inicio,
      fechaFin: cm.fecha_fin,
      estado: cm.estado as any,
      diasRestantes: cm.dias_restantes !== undefined ? cm.dias_restantes : this.calcularDiasRestantes(cm.fecha_fin)
    };
  }

  async cargarMembresias(): Promise<Membresia[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/suscripciones/todas`));
      const mapped = resp.map(cm => this.mapToMembresia(cm));
      this._membresias.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar membresías:', err);
      return [];
    }
  }

  obtenerMembresias(): Membresia[] {
    return this._membresias();
  }

  getMembresiaDeCliente(clienteId: number): Membresia | undefined {
    return this._membresias().find(m => m.clienteId === clienteId);
  }

  getMembresiaActiva(clienteId: number): Membresia | undefined {
    return this._membresias().find(m => m.clienteId === clienteId && m.estado === 'ACTIVA');
  }

  calcularDiasRestantes(fechaFin: string): number {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  async registrarMembresia(membresia: Omit<Membresia, 'id'>): Promise<Membresia> {
    // Al registrar un cliente nuevo, se le crea una membresía inicial
    // Mapeamos a la renovación o creación en el servidor
    let mId = 1;
    if (membresia.tipo.toLowerCase().includes('trimestral')) mId = 2;
    else if (membresia.tipo.toLowerCase().includes('anual')) mId = 3;

    const payload = {
      cliente_id: membresia.clienteId,
      membresia_id: mId,
      fecha_inicio: membresia.fechaInicio
    };

    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/renovar`, payload)
    );
    const nuevaM = this.mapToMembresia(response);
    this._membresias.update(lista => [...lista.filter(m => m.clienteId !== membresia.clienteId), nuevaM]);
    return nuevaM;
  }

  async renovarMembresia(clienteId: number, tipo: string, precio: number, meses: number): Promise<Membresia> {
    let mId = 1;
    try {
      const cat = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const match = cat.find(m => m.nombre.toLowerCase().includes(tipo.toLowerCase()));
      if (match) {
        mId = match.id;
      }
    } catch (e) {
      if (tipo.toLowerCase().includes('trimestral')) mId = 2;
      else if (tipo.toLowerCase().includes('anual')) mId = 3;
    }

    const payload = {
      cliente_id: clienteId,
      membresia_id: mId,
      fecha_inicio: new Date().toISOString().split('T')[0]
    };

    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/renovar`, payload)
    );
    const nuevaM = this.mapToMembresia(response);
    this._membresias.update(lista => [...lista.filter(m => m.clienteId !== clienteId), nuevaM]);
    return nuevaM;
  }
}
