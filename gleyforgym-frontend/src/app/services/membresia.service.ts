import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Membresia, PlanMembresia } from '../models/membresia';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/membresias';

  private _membresias = signal<Membresia[]>([]);
  private _planes = signal<PlanMembresia[]>([]);

  readonly membresias = this._membresias.asReadonly();
  readonly planes = this._planes.asReadonly();

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
    // Buscar el ID del plan en los planes ya cargados en memoria
    const planesCache = this._planes();
    const match = planesCache.find(p => p.nombre.toLowerCase() === tipo.toLowerCase())
      ?? planesCache.find(p => p.nombre.toLowerCase().includes(tipo.toLowerCase()));

    let mId = match ? match.id : 1;

    // Fallback: si no hay planes en caché, cargarlos
    if (!match && planesCache.length === 0) {
      try {
        const cat = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
        const found = cat.find(m => m.nombre.toLowerCase().includes(tipo.toLowerCase()));
        if (found) mId = found.id;
      } catch (e) {
        if (tipo.toLowerCase().includes('trimestral')) mId = 2;
        else if (tipo.toLowerCase().includes('anual')) mId = 3;
      }
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

  private mapToPlanMembresia(m: any): PlanMembresia {
    return {
      id: m.id,
      nombre: m.nombre,
      descripcion: m.descripcion || '',
      precio: +m.precio,
      duracionDias: m.duracion_dias,
      activa: m.activa
    };
  }

  async cargarPlanes(): Promise<PlanMembresia[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(m => this.mapToPlanMembresia(m));
      this._planes.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar catálogo de planes:', err);
      return [];
    }
  }

  async actualizarPlanBase(id: number, plan: Partial<PlanMembresia>): Promise<PlanMembresia> {
    const payload: any = {};
    if (plan.nombre !== undefined) payload.nombre = plan.nombre;
    if (plan.descripcion !== undefined) payload.descripcion = plan.descripcion;
    if (plan.precio !== undefined) payload.precio = plan.precio;
    if (plan.duracionDias !== undefined) payload.duracion_dias = plan.duracionDias;
    if (plan.activa !== undefined) payload.activa = plan.activa;

    const resp = await firstValueFrom(
      this.http.put<any>(`${this.apiUrl}/${id}`, payload)
    );
    const updated = this.mapToPlanMembresia(resp);
    this._planes.update(lista => lista.map(p => p.id === id ? updated : p));
    return updated;
  }

  async crearPlanBase(plan: Omit<PlanMembresia, 'id'>): Promise<PlanMembresia> {
    const payload = {
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio,
      duracion_dias: plan.duracionDias,
      activa: plan.activa
    };

    const resp = await firstValueFrom(
      this.http.post<any>(this.apiUrl, payload)
    );
    const nuevo = this.mapToPlanMembresia(resp);
    this._planes.update(lista => [...lista, nuevo]);
    return nuevo;
  }
}
