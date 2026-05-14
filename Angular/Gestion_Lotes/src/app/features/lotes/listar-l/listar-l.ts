import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Lote } from '../../../shared/models/lote';
import { CambiarEstadoLoteDto } from '../../../shared/models/loteDto';
import { DESTINOS_SALIDA } from '../../../shared/models/movimiento';
import { CrearMovimientoDto } from '../../../shared/models/movimientoDto';

@Component({
  selector: 'app-listar-l',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './listar-l.html',
  styleUrl: './listar-l.css',
})
export class ListarL implements OnInit {

  lotes: Lote[] = []; // Lista de lotes cargados desde el servidor
  lotesFiltrados: Lote[] = []; // Lista de lotes filtrados
  filtroEstado: string = ''; // Estado seleccionado para el filtro
  busqueda: string = ''; // Texto de busqueda
  loading = false;
  error = '';

  constructor(private servidor: Servidor, public authService: AuthService) {}

  get esAdmin(): boolean {
    return this.authService.rol === 'ADMIN';
  }

  get esOperador(): boolean {
    return this.authService.rol === 'OPERADOR';
  }

  get esSupervisor(): boolean {
    return this.authService.rol === 'SUPERVISOR';
  }

  get puedeCrear(): boolean {
    return this.authService.rol === 'ADMIN' || this.authService.rol === 'OPERADOR';
  }

  ngOnInit() {
    this.cargarLotes();
  }

  cargarLotes() {
    this.loading = true;
    this.error = '';

    this.servidor.listarLotes().subscribe({
      next: (lotes) => {
        this.lotes = Array.isArray(lotes) ? lotes : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.filtrarLotes(); // Filtrar los lotes
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar lotes';
        this.loading = false;
        console.error(err);
      },
    });
  }

filtrarLotes() {
    let resultado = [...this.lotes];

    if (this.filtroEstado) {
      resultado = resultado.filter(l => l.estado === this.filtroEstado);
    }

    if (this.busqueda) {
      const search = this.busqueda.toLowerCase();
      resultado = resultado.filter(l => 
        l.codigo_lote.toLowerCase().includes(search)
      );
    }
    this.lotesFiltrados = resultado;
  }

  // Metodo para solo cambiar el estado del lote para aprobar o rechazar
  cambiarEstado(lote: Lote, nuevoEstado: CambiarEstadoLoteDto['estado'], observaciones?: string) {
    this.servidor.editarEstadoLote(lote.id, { 
      estado: nuevoEstado, 
      observaciones: observaciones || undefined 
    }).subscribe({
      next: (loteActualizado) => {
        lote.estado = loteActualizado.estado;
        this.filtrarLotes();
        alert(`Lote ${nuevoEstado === 'APROBADO' ? 'aprobado' : 'rechazado'} correctamente`);
      },
      error: (err) => {
        alert(err.error?.error || 'Error al cambiar el estado del lote');
        console.error(err);
      },
    });
  }

  //----------- APROBACIÓN MODAL ---------------
  mostrarModalAprobacion = false;
  loteSeleccionadoAprobacion: Lote | null = null;
  observacionesAprobacion = '';
  loadingAprobacion = false;
  errorAprobacion = '';

  abrirModalAprobacion(lote: Lote) {
    this.loteSeleccionadoAprobacion = lote;
    this.observacionesAprobacion = '';
    this.errorAprobacion = '';
    this.mostrarModalAprobacion = true;
  }

  cerrarModalAprobacion() {
    this.mostrarModalAprobacion = false;
    this.loteSeleccionadoAprobacion = null;
  }

  confirmaAprobacion() {
    this.loadingAprobacion = true;
    this.cambiarEstado(this.loteSeleccionadoAprobacion!, 'APROBADO', );
    this.cerrarModalAprobacion();
    this.loadingAprobacion = false;
  }

  //----------- RECHAZO MODAL ---------------
  mostrarModalRechazo = false;
  loteSeleccionadoRechazo: Lote | null = null;
  motivoRechazo = '';
  loadingRechazo = false;
  errorRechazo = '';

  abrirModalRechazo(lote: Lote) {
    this.loteSeleccionadoRechazo = lote;
    this.motivoRechazo = '';
    this.errorRechazo = '';
    this.mostrarModalRechazo = true;
  }

  cerrarModalRechazo() {
    this.mostrarModalRechazo = false;
    this.loteSeleccionadoRechazo = null;
  }

  confirmaRechazo() {
    if (!this.motivoRechazo?.trim()) {
      this.errorRechazo = 'Ingrese el motivo de rechazo';
      return;
    }

    this.loadingRechazo = true;
    this.cambiarEstado(this.loteSeleccionadoRechazo!, 'RECHAZADO', this.motivoRechazo);
    this.cerrarModalRechazo();
    this.loadingRechazo = false;
  }

  //----------- SALIDAS -----------//
  mostrarModalSalida = false; // Colocamos false para que no se muestre hasta que se llame
  loteSeleccionado: Lote | null = null; // Creamos una variable el cual contendra un objeto de tipo lote y colocamos null para que no se muestre hasta que se llame
  destinoSalida = ''; // Creamos una variable el cual contendra el destino de la salida
  cantidadSalida: number | null = null; // Creamos una variable el cual contendra la cantidad de la salida
  observacionesSalida = ''; // Creamos una variable el cual contendra las observaciones
  loadingSalida = false;
  errorSalida = '';
  destinosSalida = DESTINOS_SALIDA; // Creamos una variable el cual contendra los destinos

  // Funcion para abrir el modal
  abrirModalSalida(lote: Lote) {
    this.loteSeleccionado = lote; // Cargamos el lote en la variable
    this.cantidadSalida = null; // Limpiamos la cantidad
    this.destinoSalida = ''; // Limpiamos el destino
    this.observacionesSalida = '';
    this.errorSalida = '';
    this.mostrarModalSalida = true; // Mostramos el modal al abrir el modal
  }

  // Funcion para cerrar el modal
  cerrarModalSalida() {
    this.mostrarModalSalida = false;
    this.loteSeleccionado = null;
  }

  registrarSalida() {
    if (!this.loteSeleccionado || !this.cantidadSalida || !this.destinoSalida) {
      this.errorSalida = 'Complete todos los campos requeridos';
      return;
    }

    if (this.cantidadSalida <= 0) {
      this.errorSalida = 'La cantidad debe ser mayor a 0';
      return;
    }

    if (this.cantidadSalida > this.loteSeleccionado.cantidad_actual) {
      this.errorSalida = `La cantidad excede lo disponible: ${this.loteSeleccionado.cantidad_actual}`;
      return;
    }

    this.loadingSalida = true;
    this.errorSalida = '';

    //Creamos un objeto de tipo CrearMovimientoDto con solo los campos requeridos para mandar
    //Para este caso siempre sera un movimiento de salida
    const movimiento: CrearMovimientoDto = {
      lote: this.loteSeleccionado.id,
      tipo: 'SALIDA',
      cantidad: this.cantidadSalida,
      destino: this.destinoSalida,
      observaciones: this.observacionesSalida || null,
    };
    
    // Mandamos el movimiento
    this.servidor.registrarMovimiento(movimiento).subscribe({
      next: (movimientoCreado) => { // Obtenemos el movimiento creado
        // Actualizamos la cantidad del lote
        this.loteSeleccionado!.cantidad_actual = movimientoCreado.cantidad;
        if (this.loteSeleccionado!.cantidad_actual === 0) {
          this.loteSeleccionado!.estado = 'AGOTADO';
        }

        // Actualizamos la lista de lotes
        this.filtrarLotes();
        this.cerrarModalSalida(); // Cerramos el modal
        alert('Salida registrada correctamente');
        this.loadingSalida = false; // Cerramos el loading
      },
      error: (err) => {
        this.errorSalida = err.error?.error || 'Error al registrar la salida';
        this.loadingSalida = false;
        console.error(err);
      },
    });
  }
}
