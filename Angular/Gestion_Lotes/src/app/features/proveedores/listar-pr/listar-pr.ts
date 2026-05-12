import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Proveedor } from '../../../shared/models/proveedor';

@Component({
  selector: 'app-listar-pr',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './listar-pr.html',
  styleUrl: './listar-pr.css',
})
export class ListarPr implements OnInit {
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  busqueda: string = '';
  loading = false;
  error: string = '';

  constructor(
    private servidor: Servidor,
    public authService: AuthService
  ) {}

  get esAdmin(): boolean {
    return this.authService.rol === 'ADMIN';
  }

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.loading = true;
    this.error = '';

    this.servidor.listarProveedores().subscribe({
      next: (data) => {
        this.proveedores = Array.isArray(data) ? data : [];
        this.proveedoresFiltrados = [...this.proveedores];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar proveedores';
        this.loading = false;
        console.error(err);
      },
    });
  }

  filtrarProveedores() {
    const search = this.busqueda.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search)
    );
  }

  eliminarProveedor(id: number) {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) {
      return;
    }

    this.servidor.eliminarProveedor(id).subscribe({
      next: () => {
        this.proveedores = this.proveedores.filter((p) => p.id !== id);
        this.filtrarProveedores();
        alert('Proveedor eliminado correctamente');
      },
      error: (err) => {
        alert('Error al eliminar proveedor');
        console.error(err);
      },
    });
  }
}