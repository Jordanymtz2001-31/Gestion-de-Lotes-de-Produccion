import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Movimiento, TODOS_DESTINOS, TIPOS_MOVIMIENTO } from '../../../shared/models/movimiento';
import { Lote } from '../../../shared/models/lote';
import { Usuario } from '../../../shared/models/usuario';

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
    return this.authService.rol === 'ADMIN';
  }

  get esSupervisor(): boolean {
    return this.authService.rol === 'SUPERVISOR';
  }

  get esOperador(): boolean {
    return this.authService.rol === 'OPERADOR';
  }

  ngOnInit() {
    this.loading = true;
    // Solo cargamos estas dos servicios cuando son OPERADO/SUPERVISOR
    const peticiones: any = {
      movimientos: this.servidor.listarMovimientos(),
      lotes: this.servidor.listarLotes(),
    };

    // Solo ADMIN necesita la lista de usuarios
    if (this.esAdmin) {
      peticiones.usuarios = this.servidor.listarUsuarios(); // Agregamos la petición de obtener los usuarios al objeto peticiones
    }

    // Hacemos una petición para obtener los movimientos, lotes y usuarios en paralelo
    // Con forkJoin() podemos realizar varias peticiones en paralelo
    forkJoin(peticiones).subscribe({
      next: (data: any) => {
        this.movimientos = Array.isArray(data.movimientos) ? data.movimientos : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.lotes = Array.isArray(data.lotes) ? data.lotes : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio 
        this.usuarios = Array.isArray(data.usuarios) ? data.usuarios : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.filtrarMovimientos(); // Llamar a la función para filtrar los movimientos
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // Función para obtener el código del lote
  getLoteCodigo(loteId: number): string { // loteId es el id del lote que queremos obtener
    const lote = this.lotes.find(l => l.id === loteId); // con find() buscamos el lote en el array de lotes
    return lote?.codigo_lote || `Lote ${loteId}`; // si el lote no se encuentra en el array, se devuelve un string con el id del lote
  }

  // Función para obtener el nombre del usuario
  getUsuarioNombre(usuarioId: number): string { // usuarioId es el id del usuario que queremos obtener
    const usuario = this.usuarios.find(u => u.id === usuarioId); // con find() buscamos el usuario en el array de usuarios
    if (!this.esAdmin) { // si no es admin y el usuario no se encuentra en el array de usuarios
      return 'N/A';
    }
    // Pero si es admin y el usuario no se encuentra en el array de usuarios
    const usuarioN = this.usuarios.find(u => u.id === usuarioId); // con find() buscamos el usuario en el array de usuarios
    return usuarioN?.username || `Usuario ${usuarioId}`; // si el usuario no se encuentra en el array, se devuelve un string con el id del usuario
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
}