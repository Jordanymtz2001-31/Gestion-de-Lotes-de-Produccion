import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Movimiento, TODOS_DESTINOS, TIPOS_MOVIMIENTO } from '../../../shared/models/movimiento';
import { Lote } from '../../../shared/models/lote';
import { Usuario } from '../../../shared/models/usuario';
import { getMensajeError } from '../../../core/utils/utils';
import * as XLSX from 'xlsx'; 

  //Encabezados para el excel
  const headers = {
    id: 'Identificador',
    lote: 'Codigo de Lote',
    usuario: 'Usuario',
    tipo: 'Tipo',
    destino: 'Destino',
    cantidad: 'Cantidad',
    observaciones: 'Observaciones',
    fecha: 'Fecha',
  }

@Component({
  selector: 'app-listar-mov',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-mov.html',
  styleUrl: './listar-mov.css',
})
export class ListarMov implements OnInit {

  movimientos: Movimiento[] = []; // Array para almacenar los movimientos obtenidos del servidor
  movimientosFiltrados: Movimiento[] = []; // Array para almacenar los movimientos filtrados
  lotes: Lote[] = []; // Array para almacenar los lotes obtenidos del servidor
  usuarios: Usuario[] = []; // Array para almacenar los usuarios obtenidos del servidor
  loading = false;
  error = '';

  filtroTipo = '';
  filtroDestino = '';
  filtroFecha = '';

  tipos = TIPOS_MOVIMIENTO;
  destinos = TODOS_DESTINOS;

  constructor(private servidor: Servidor, public authService: AuthService) {}

  get esAdmin(): boolean {
    return this.authService.usuarioActual()?.rol === 'ADMIN';
  }

  get esSupervisor(): boolean {
    return this.authService.usuarioActual()?.rol === 'SUPERVISOR';
  }

  get esOperador(): boolean {
    return this.authService.usuarioActual()?.rol === 'OPERADOR';
  }

  ngOnInit() {
    this.loading = true;
    // Solo cargamos estas dos servicios cuando son OPERADO/SUPERVISOR
    const peticiones: any = {
      movimientos: this.servidor.listarMovimientos().pipe(
        catchError(() => {
          this.error = 'No se pudo cargar movimientos';
          return of([]);
        })
      ),
      lotes: this.servidor.listarLotes().pipe(
        catchError(() => {
          this.error = 'No se pudo cargar lotes';
          return of([]);
        })
      ),
    };

    // Solo ADMIN necesita la lista de usuarios
    if (this.esAdmin) {
      peticiones.usuarios = this.servidor.listarUsuarios().pipe(
        catchError(() => {
          this.error = 'No se pudo cargar usuarios';
          return of([]);
        })
      );
    }

    forkJoin(peticiones).subscribe({
      next: (data: any) => {
        this.movimientos = Array.isArray(data.movimientos) ? data.movimientos : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.lotes = Array.isArray(data.lotes) ? data.lotes : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio 
        this.usuarios = Array.isArray(data.usuarios) ? data.usuarios : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.filtrarMovimientos(); // Llamar a la función para filtrar los movimientos
        this.loading = false;
      },
      error: (err) => {
        this.error = getMensajeError(err);
        this.loading = false;
      },
    });
  }

  // Función para obtener el código del lote
  getLoteCodigo(loteId: number): string { // loteId es el id del lote que queremos obtener
    const lote = this.lotes.find(l => l.id === loteId); // con find() buscamos el lote en el array de lotes
    return lote?.codigo_lote || `Lote ${loteId}`; // si el lote no se encuentra en el array, se devuelve un string con el id del lote
  }

  getUsuarioNombre(usuarioId: number): string {
    if (!this.esAdmin) return 'N/A';
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario?.username || `Usuario ${usuarioId}`;
  }


  filtrarMovimientos() {
    let resultado = [...this.movimientos];

    if (this.filtroTipo) {
      resultado = resultado.filter(m => m.tipo === this.filtroTipo);
    }

    if (this.filtroDestino) {
      resultado = resultado.filter(m => m.destino === this.filtroDestino);
    }

    if (this.filtroFecha) {
      resultado = resultado.filter(m => {
        const fechaMov = new Date(m.fecha).toISOString().split('T')[0];
        return fechaMov === this.filtroFecha;
      });
    }

    this.movimientosFiltrados = resultado;
  }

  limpiarFiltros() {
    this.filtroTipo = '';
    this.filtroDestino = '';
    this.filtroFecha = '';
    this.filtrarMovimientos();
  }

  //Metodo para filtrar cierto destinos para el Operador cuando filtre los movimientos
  get destinosFiltrados() {
    if (this.authService.rol === 'OPERADOR') {
      return this.destinos.filter(d => d.value !== 'DEVOLUCION_PROV');
    }
    return this.destinos;
  }
  
  // Función para obtener la clase del badge dependiendo del tipo de movimiento se muestre en color verde o rojo
  getBadgeClass(tipo: string): string {
    return tipo === 'ENTRADA' ? 'badge-success' : 'badge-danger';
  }

  exportAExcel(): void {
    this.servidor.listarMovimientos().subscribe(
      (movimientos) => {
        // Ajustamos las cabeceras a los nombres de las columnas
        const movimientosConEncabezados = movimientos.map((m) => ({
          [headers.id]: m.id,

          //Le paso los metodos getLoteCodigo y getUsuarioNombre
          [headers.lote]: this.getLoteCodigo(m.lote),
          [headers.usuario]: this.getUsuarioNombre(m.usuario_id),
          
          [headers.tipo]: m.tipo,
          [headers.cantidad]: m.cantidad,
          [headers.destino]: m.destino,
          [headers.observaciones]: m.observaciones,
          [headers.fecha]: m.fecha
        }))
        // Convertir array de movimientos a hoja de calculo
        const worksheet = XLSX.utils.json_to_sheet(movimientosConEncabezados);
        // Crea workbook 
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

        // Descargar como archivo excel
        XLSX.writeFile(workbook, 'movimientos.xlsx');
      },
      (error) => {
        console.error('Error al exportar a Excel', error);
      }
    )
  }
}