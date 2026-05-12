import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Proveedor } from '../../../shared/models/proveedor';

@Component({
  selector: 'app-buscar-pr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-pr.html',
  styleUrl: './buscar-pr.css',
})
export class BuscarPr {
  termino: string = '';
  resultados: Proveedor[] = [];
  loading = false;
  error = '';
  buscando = false;

  constructor(private servidor: Servidor) {}

  buscar() {
    if (!this.termino.trim()) {
      this.error = 'Ingrese un término de búsqueda';
      return;
    }

    this.loading = true;
    this.error = '';
    this.buscando = true;

    this.servidor.listarProveedores().subscribe({
      next: (proveedores) => {
        const search = this.termino.toLowerCase();
        this.resultados = (proveedores as Proveedor[]).filter(
          (p) =>
            p.nombre.toLowerCase().includes(search) ||
            p.email.toLowerCase().includes(search) ||
            p.telefono.includes(search)
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al buscar proveedores';
        this.loading = false;
        console.error(err);
      },
    });
  }

  limpiar() {
    this.termino = '';
    this.resultados = [];
    this.buscando = false;
    this.error = '';
  }
}