import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Pago } from '../models/pago';
import { MembresiaService } from './membresia.service';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private membresiaService = inject(MembresiaService);
  private apiUrl = 'http://localhost:8000/api/pagos/';

  private _pagos = signal<Pago[]>([]);

  readonly pagos = this._pagos.asReadonly();

  readonly pagosDelCliente = computed(() =>
    this._pagos().filter(p => p.clienteId === 5)
  );

  private mapToPago(p: any): Pago {
    return {
      id: p.id,
      clienteId: p.cliente_id,
      monto: +p.monto,
      fecha: p.fecha_pago,
      concepto: p.observacion || 'Cuota de membresía',
      metodo: p.metodo_pago,
      estado: p.estado
    };
  }

  async cargarPagos(): Promise<Pago[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(p => this.mapToPago(p));
      this._pagos.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      return [];
    }
  }

  obtenerPagos(): Pago[] {
    return this._pagos();
  }

  getPagosDeCliente(clienteId: number): Pago[] {
    return this._pagos().filter(p => p.clienteId === clienteId);
  }

  getPagosPendientes(clienteId: number): Pago[] {
    return this._pagos().filter(p => p.clienteId === clienteId && p.estado === 'PENDIENTE');
  }

  async agregarPago(pago: Omit<Pago, 'id'>): Promise<void> {
    let subMembresiaId = 0;
    
    // Obtener la membresía activa del cliente
    try {
      const sub = await firstValueFrom(
        this.http.get<any>(`http://localhost:8000/api/membresias/cliente/${pago.clienteId}/activa`)
      );
      subMembresiaId = sub.id;
    } catch (e) {
      const localSub = this.membresiaService.getMembresiaDeCliente(pago.clienteId);
      if (localSub) {
        subMembresiaId = localSub.id;
      }
    }

    if (subMembresiaId === 0) {
      try {
        const hist = await firstValueFrom(
          this.http.get<any[]>(`http://localhost:8000/api/membresias/cliente/${pago.clienteId}/historial`)
        );
        if (hist && hist.length > 0) {
          subMembresiaId = hist[0].id;
        }
      } catch (err) {
        console.error('No se pudo encontrar membresía asociada para realizar el pago.');
      }
    }

    if (subMembresiaId === 0) {
      throw {
        error: {
          detail: 'El cliente seleccionado no tiene ninguna membresía activa o previa. Asigne una membresía al cliente antes de registrar un pago.'
        }
      };
    }

    const payload = {
      cliente_membresia_id: subMembresiaId,
      monto: pago.monto,
      metodo_pago: pago.metodo.toUpperCase(),
      estado: pago.estado.toUpperCase(),
      comprobante: (pago as any).comprobante || '',
      observacion: pago.concepto,
      fecha_pago: pago.fecha || new Date().toISOString().split('T')[0]
    };

    const response = await firstValueFrom(
      this.http.post<any>(this.apiUrl, payload)
    );
    const nuevoP = this.mapToPago(response);
    this._pagos.update(lista => [...lista, nuevoP]);
  }
}
