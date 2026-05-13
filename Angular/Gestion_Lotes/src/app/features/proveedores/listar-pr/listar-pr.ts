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
  imports: [RouterLink, FormsModule],
  templateUrl: './listar-pr.html',
  styleUrl: './listar-pr.css',
})
export class ListarPr implements OnInit {

  proveedores: Proveedor[] = []; // Lista de proveedores que se cargan desde el servidor
  proveedoresFiltrados: Proveedor[] = []; // Lista de proveedores filtrados
  busqueda: string = ''; // Variable para almacenar la busqueda
  loading = false;
  error: string = '';

  constructor(private servidor: Servidor, public authService: AuthService) {}

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
      next: (proveedores) => {
        this.proveedores = Array.isArray(proveedores) ? proveedores : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.proveedoresFiltrados = [...this.proveedores]; // Hacer una copia de los proveedores para que se muestren los proveedores filtrados
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
    // Creamos una variable para almacenar la busqueda, y antes con el toLowerCase() es para que no se distinga entre mayusculas y minusculas
    const search = this.busqueda.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search) // Filtrar los proveedores por nombre
    );
  }

  eliminarProveedor(id: number) {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) {
      return;
    }

    this.servidor.eliminarProveedor(id).subscribe({
      next: () => {
        this.proveedores = this.proveedores.filter((p) => p.id !== id); // Filtramos los proveedores para que no se muestre el proveedor eliminado
        this.filtrarProveedores(); // Actualizamos la lista de proveedores
        alert('Proveedor eliminado correctamente');
      },
      error: (err) => {
        alert('Error al eliminar proveedor');
        console.error(err);
      },
    });
  }
}