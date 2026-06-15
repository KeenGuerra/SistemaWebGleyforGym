import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { MembresiaService } from '../../../services/membresia.service';
import { ClienteService } from '../../../services/cliente.service';
import { PagoService } from '../../../services/pago.service';
import { Membresia, PlanMembresia } from '../../../models/membresia';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
})
export class Membresias implements OnInit {
  private membresiaService = inject(MembresiaService);
  private clienteService = inject(ClienteService);
  private pagoService = inject(PagoService);

  ngOnInit(): void {
    this.membresiaService.cargarMembresias();
    this.clienteService.cargarClientes();
    this.pagoService.cargarPagos();
    this.membresiaService.cargarPlanes();
  }

  // Control de pestañas (Tabs)
  readonly activeTab = signal<'suscripciones' | 'planes'>('suscripciones');

  // Filtros
  readonly selectedFilter = signal<'todas' | 'activas' | 'vencidas'>('todas');

  // Modales
  readonly showRenewModal = signal<boolean>(false);
  readonly selectedMembresia = signal<Membresia | null>(null);

  readonly showPlanModal = signal<boolean>(false);
  readonly editingPlan = signal<PlanMembresia | null>(null);
  readonly planes = this.membresiaService.planes;

  // Signals de Carga y Error
  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public renewModel = signal({
    clienteId: 0,
    tipo: 'Mensual Premium',
    precio: 2500,
    meses: 1
  });
  public renewForm = form(this.renewModel);

  // Estados Touched
  public tipoTouched = signal(false);
  public precioTouched = signal(false);
  public mesesTouched = signal(false);

  // Validaciones
  public tipoErrores = computed(() => {
    const valor = this.renewForm.tipo().value().trim();
    if (!valor) return 'El tipo de membresía es obligatorio.';
    return null;
  });

  public precioErrores = computed(() => {
    const valor = this.renewForm.precio().value();
    if (valor === null || valor === undefined) return 'El precio es obligatorio.';
    if (valor <= 0) return 'El precio debe ser un valor positivo.';
    return null;
  });

  public mesesErrores = computed(() => {
    const valor = this.renewForm.meses().value();
    if (valor === null || valor === undefined) return 'Los meses son obligatorios.';
    if (valor <= 0) return 'La cantidad de meses debe ser mayor a cero.';
    return null;
  });

  public formularioValido = computed(() => {
    return !this.tipoErrores() && !this.precioErrores() && !this.mesesErrores();
  });

  // Modelo del Formulario de Plan Base (Catálogo)
  public planModel = signal({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionDias: 30,
    activa: true
  });
  public planForm = form(this.planModel);

  // Estados Touched - Plan Base
  public planNombreTouched = signal(false);
  public planPrecioTouched = signal(false);
  public planDuracionTouched = signal(false);

  // Validaciones - Plan Base
  public planNombreErrores = computed(() => {
    const valor = this.planForm.nombre().value().trim();
    if (!valor) return 'El nombre del plan es obligatorio.';
    return null;
  });

  public planPrecioErrores = computed(() => {
    const valor = this.planForm.precio().value();
    if (valor === null || valor === undefined) return 'El precio es obligatorio.';
    if (valor < 0) return 'El precio no puede ser negativo.';
    return null;
  });

  public planDuracionErrores = computed(() => {
    const valor = this.planForm.duracionDias().value();
    if (valor === null || valor === undefined) return 'La duración es obligatoria.';
    if (valor <= 0) return 'La duración en días debe ser mayor a cero.';
    return null;
  });

  public planFormValido = computed(() => {
    return !this.planNombreErrores() && !this.planPrecioErrores() && !this.planDuracionErrores();
  });

  // Lista decorada con nombres
  readonly membresiasDecoradas = computed(() => {
    const list = this.membresiaService.membresias();
    const filter = this.selectedFilter();

    const decoradas = list.map(m => {
      const cliente = this.clienteService.getClientePorId(m.clienteId);
      const diasRestantes = this.membresiaService.calcularDiasRestantes(m.fechaFin);
      return {
        ...m,
        nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Inactivo/Eliminado',
        diasRestantesCalculados: diasRestantes,
        estaVencida: diasRestantes === 0 || m.estado === 'VENCIDA'
      };
    });

    return decoradas.filter(m => {
      if (filter === 'activas') return !m.estaVencida;
      if (filter === 'vencidas') return m.estaVencida;
      return true;
    });
  });

  setFilter(filter: 'todas' | 'activas' | 'vencidas'): void {
    this.selectedFilter.set(filter);
  }

  openRenewModal(membresia: Membresia): void {
    this.selectedMembresia.set(membresia);

    // Buscar el plan real que coincide con el tipo actual de la membresía
    const planesDisponibles = this.planes();
    const planActual = planesDisponibles.find(p => p.nombre === membresia.tipo) ?? planesDisponibles[0];

    this.renewModel.set({
      clienteId: membresia.clienteId,
      tipo: planActual ? planActual.nombre : membresia.tipo,
      precio: planActual ? planActual.precio : membresia.precio,
      meses: planActual ? Math.round(planActual.duracionDias / 30) || 1 : 1
    });

    this.tipoTouched.set(false);
    this.precioTouched.set(false);
    this.mesesTouched.set(false);

    this.showRenewModal.set(true);
  }

  closeRenewModal(): void {
    this.showRenewModal.set(false);
    this.selectedMembresia.set(null);
  }

  onPlanChange(event: Event): void {
    const planNombre = (event.target as HTMLSelectElement).value;
    const planSeleccionado = this.planes().find(p => p.nombre === planNombre);

    const pVal = planSeleccionado ? planSeleccionado.precio : 0;
    const mVal = planSeleccionado ? Math.round(planSeleccionado.duracionDias / 30) || 1 : 1;

    this.renewModel.update(m => ({
      ...m,
      tipo: planNombre,
      precio: pVal,
      meses: mVal
    }));
  }

  async saveRenewal(): Promise<void> {
    this.tipoTouched.set(true);
    this.precioTouched.set(true);
    this.mesesTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    const m = this.selectedMembresia();

    if (m) {
      this.cargando.set(true);
      this.error.set(null);
      try {
        // Renovar en servicio
        await this.membresiaService.renovarMembresia(m.clienteId, this.renewForm.tipo().value(), this.renewForm.precio().value(), this.renewForm.meses().value());

        // Registrar pago
        await this.pagoService.agregarPago({
          clienteId: m.clienteId,
          monto: this.renewForm.precio().value(),
          fecha: new Date().toISOString().split('T')[0],
          concepto: `Renovación de Membresía ${this.renewForm.tipo().value()}`,
          metodo: 'TARJETA',
          estado: 'PAGADO'
        });
        
        this.cargando.set(false);
        this.closeRenewModal();
      } catch (err: any) {
        this.cargando.set(false);
        let errorMsg = 'Error al renovar la membresía. Inténtelo de nuevo.';
        if (err && err.error) {
          if (typeof err.error.detail === 'string') {
            errorMsg = err.error.detail;
          } else if (Array.isArray(err.error.detail) && err.error.detail.length > 0) {
            const firstErr = err.error.detail[0];
            errorMsg = firstErr.msg || 'Error de validación';
          } else if (err.error.message) {
            errorMsg = err.error.message;
          }
        }
        this.error.set(errorMsg);
      }
    } else {
      this.closeRenewModal();
    }
  }

  openPlanModal(plan?: PlanMembresia): void {
    if (plan) {
      this.editingPlan.set(plan);
      this.planModel.set({
        nombre: plan.nombre,
        descripcion: plan.descripcion,
        precio: plan.precio,
        duracionDias: plan.duracionDias,
        activa: plan.activa
      });
    } else {
      this.editingPlan.set(null);
      this.planModel.set({
        nombre: '',
        descripcion: '',
        precio: 0,
        duracionDias: 30,
        activa: true
      });
    }

    this.planNombreTouched.set(false);
    this.planPrecioTouched.set(false);
    this.planDuracionTouched.set(false);
    this.error.set(null);
    this.showPlanModal.set(true);
  }

  closePlanModal(): void {
    this.showPlanModal.set(false);
    this.editingPlan.set(null);
  }

  async savePlan(): Promise<void> {
    this.planNombreTouched.set(true);
    this.planPrecioTouched.set(true);
    this.planDuracionTouched.set(true);

    if (!this.planFormValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const values = {
      nombre: this.planForm.nombre().value(),
      descripcion: this.planForm.descripcion().value(),
      precio: this.planForm.precio().value(),
      duracionDias: this.planForm.duracionDias().value(),
      activa: this.planForm.activa().value()
    };

    const editing = this.editingPlan();

    try {
      if (editing) {
        await this.membresiaService.actualizarPlanBase(editing.id, values);
      } else {
        await this.membresiaService.crearPlanBase(values);
      }
      this.cargando.set(false);
      this.closePlanModal();
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al guardar el plan de membresía. Inténtelo de nuevo.';
      if (err && err.error) {
        if (typeof err.error.detail === 'string') {
          errorMsg = err.error.detail;
        } else if (Array.isArray(err.error.detail) && err.error.detail.length > 0) {
          const firstErr = err.error.detail[0];
          errorMsg = firstErr.msg || 'Error de validación';
        } else if (err.error.message) {
          errorMsg = err.error.message;
        }
      }
      this.error.set(errorMsg);
    }
  }
}
