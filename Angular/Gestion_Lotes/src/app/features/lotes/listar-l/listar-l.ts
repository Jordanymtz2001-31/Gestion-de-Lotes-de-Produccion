import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Lote } from '../../../shared/models/lote';
import { CambiarEstadoLoteDto } from '../../../shared/models/loteDto';

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
    let resultado = [...this.lotes]; // Hacer una copia de los lotes

    // Filtro por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(l => l.estado === this.filtroEstado);
    }

    // Filtro por búsqueda (código)
    if (this.busqueda) {
      const search = this.busqueda.toLowerCase(); // El toLowerCase() es para que no se distinga entre mayusculas y minusculas
      resultado = resultado.filter(l => 
        l.codigo_lote.toLowerCase().includes(search) // Filtrar los lotes por código
      );
    }
    // Asignar los lotes filtrados sensegun la busqueda y el estado a la variable para mostrar
    this.lotesFiltrados = resultado;
  }

  cambiarEstado(lote: Lote, nuevoEstado: CambiarEstadoLoteDto['estado']) { // Cambiar el estado de un lote pero solo si el usuario es supervisor o admin
    this.servidor.editarEstadoLote(lote.id, { estado: nuevoEstado }).subscribe({
      next: (loteActualizado) => {
        lote.estado = loteActualizado.estado; // Actualizar el estado del lote
        this.filtrarLotes();
        alert('Estado actualizado correctamente');
      },
      error: (err) => {
        alert(this.error = err.error?.error || 'Error al cambiar el estado del lote');
        console.error(err);
      },
    });
  }
}