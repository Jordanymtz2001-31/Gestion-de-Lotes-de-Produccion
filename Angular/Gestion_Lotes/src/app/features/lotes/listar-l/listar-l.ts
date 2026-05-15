import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Lote } from '../../../shared/models/lote';
import { Producto } from '../../../shared/models/producto';
import { Proveedor } from '../../../shared/models/proveedor';
import { CambiarEstadoLoteDto } from '../../../shared/models/loteDto';
import { DESTINOS_SALIDA, TODOS_DESTINOS } from '../../../shared/models/movimiento';
import { CrearMovimientoDto } from '../../../shared/models/movimientoDto';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-listar-l',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './listar-l.html',
  styleUrl: './listar-l.css',
})
export class ListarL implements OnInit {

  lotes: Lote[] = []; // Creamos un array para almacenar los lotes que vienen del servidor
  lotesFiltrados: Lote[] = []; // Creamos un array para almacenar los lotes filtrados
  productos: Producto[] = []; // Creamos un array para almacenar los productos que vienen del servidor
  proveedores: Proveedor[] = []; // Creamos un array para almacenar los proveedores que vienen del servidor
  filtroEstado: string = '';
  busqueda: string = '';
  loading = false;
  errores: string[] = []; // Creamos un array para almacenar los errores
  destinos = TODOS_DESTINOS;

  constructor(private servidor: Servidor, public authService: AuthService) {}

  get esAdmin(): boolean {
    return this.authService.usuarioActual()?.rol === 'ADMIN'; 
  }

  get esOperador(): boolean {
    return this.authService.usuarioActual()?.rol === 'OPERADOR';
  }

  get esSupervisor(): boolean {
    return this.authService.usuarioActual()?.rol === 'SUPERVISOR';
  }

  get puedeCrear(): boolean {
    const rol = this.authService.usuarioActual()?.rol;
    return rol === 'ADMIN' || rol === 'OPERADOR';
  }

  ngOnInit() {
    this.cargarLotes();
  }

  cargarLotes() {
    this.loading = true;
    this.errores = [];

    // Hacemos una petición para obtener los lotes, productos y proveedores en paralelo
    // Con forkJoin() podemos realizar varias peticiones en paralelo
    forkJoin({
      lotes: this.servidor.listarLotes().pipe(
        catchError(() => {
          this.errores.push('No se pudo cargar lotes');
          return of([])
        }) // Si la petición falla, devolvemos un array vacío
      ), 
      productos: this.servidor.listarProductos().pipe(
        catchError(() => {
          this.errores.push('No se pudo cargar productos'); 
          return of([]) // Con of([]) cada peticion que falla se convierte en un array vacio
        })
      ),
      proveedores: this.servidor.listarProveedores().pipe(
        catchError(() => {
          this.errores.push('No se pudo cargar proveedores'); 
          return of([]) // Si la petición falla, devolvemos un array vacío
      })
      )
    }).subscribe({
      next: (data) => {
        this.lotes = Array.isArray(data.lotes) ? data.lotes : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio 
        this.productos = Array.isArray(data.productos) ? data.productos : [];
        this.proveedores = Array.isArray(data.proveedores) ? data.proveedores : [];
        this.filtrarLotes(); // Llamar a la función para filtrar los lotes
        this.loading = false
      },
      error: (err) => {
        this.errores.push('Error al cargar datos');
        this.loading = false;
        console.error(err);
      },
    });
  }

  // Para cerrar un error individual
  cerrarError(index: number) {
    this.errores.splice(index, 1);
  }

  // Metodo para obtener el nombre de un producto dado su id
  getProductoNombre(id: number): string { // id es el id del producto que queremos obtener
    if (!this.productos.length) return 'No se pudo cargar productos'; // si el array de productos esta vacio, se devuelve un string con el id del producto
    const producto = this.productos.find(p => p.id === id); // con find() buscamos el producto en el array de productos
    return producto?.nombre || `Producto ${id}`; // si el producto no se encuentra en el array, se devuelve un string con el id del producto
  }

  getUnidadProducto(id: number): string { // id es el id del producto que queremos obtener
    if (!this.productos.length) return 'No se pudo cargar productos'; // si el array de productos esta vacio, se devuelve un string con el id del producto
    const producto = this.productos.find(p => p.id === id); // con find() buscamos el producto en el array de productos
    return producto?.unidad_medida || `Unidad ${id}`; // si el producto no se encuentra en el array, se devuelve un string con el id del producto
  }

  // Metodo para obtener el nombre de un proveedor dado su id
  getProveedorNombre(id: number): string { // id es el id del proveedor que queremos obtener
    if (!this.proveedores.length) return 'No se pudo cargar proveedores'; // si el array de proveedores esta vacio, se devuelve un string con el id del proveedor
    const proveedor = this.proveedores.find(p => p.id === id); // con find() buscamos el proveedor en el array de proveedores
    return proveedor?.nombre || `Proveedor ${id}`; // si el proveedor no se encuentra en el array, se devuelve un string con el id del proveedor
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
      observaciones: observaciones
    }).subscribe({
      next: (loteActualizado) => {
        lote.estado = loteActualizado.estado;
        this.filtrarLotes();
        Swal.fire({
          icon: 'success',
          title: 'Lote actualizado',
          text: `Lote ${nuevoEstado === 'APROBADO' ? 'aprobado' : 'rechazado'} correctamente`,
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar el estado',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
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

  // Funcion para obtener los destinos filtrados para el Operador
  get destinoSalidaFiltrados() {
    if (this.authService.rol === 'OPERADOR') {
      return this.destinosSalida.filter(d => d.value !== 'DEVOLUCION_PROV');
    }
    return this.destinos;
  }

  registrarSalida() {
    if (!this.loteSeleccionado || !this.cantidadSalida || !this.destinoSalida) {
      this.errorSalida = 'Complete todos los campos requeridos';
      return;
    }

    // Validar que sea un numero valido
    if(isNaN(this.cantidadSalida)) {
      this.errorSalida = 'La cantidad debe ser un número decimal';
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
      next: () => {
        this.cargarLotes();
        this.cerrarModalSalida();
        Swal.fire({
          icon: 'success',
          title: 'Salida registrada',
          text: 'La salida se registró correctamente',
          showConfirmButton: false,
          timer: 2000,
        });
        this.loadingSalida = false;
      },
      error: (err) => {
        this.errorSalida = getMensajeError(err);
        this.loadingSalida = false;
      },
    });
  }
}
