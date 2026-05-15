import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { AuthService } from '../../../core/interceptors/authService';
import { Producto } from '../../../shared/models/producto';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-listar-p',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listar-p.html',
  styleUrl: './listar-p.css',
})
export class ListarP implements OnInit {
  
  productos: Producto[] = []; // Arreglo para que todos los productos que vienen del servidor
  productosFiltrados: Producto[] = []; // Arreglo para que que se muestren los productos filtrados
  busqueda: string = ''; // Variable para el filtro
  loading = false;
  error: string = '';

  constructor(private servidor: Servidor, public authService: AuthService, private router: Router) {}

  get esAdmin(): boolean {
    return this.authService.usuarioActual()?.rol === 'ADMIN';
  }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true; // Mostrar el spinner
    this.error = '';

    this.servidor.listarProductos().subscribe({
      next: (productos) => {
        this.productos = Array.isArray(productos) ? productos : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.productosFiltrados = [...this.productos]; // Hacer una copia de los productos para que se muestren los productos filtrados
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
      },
    });
  }

  filtrarProductos() {
    const search = this.busqueda.toLowerCase(); // El toLowerCase() es para que no se distinga entre mayusculas y minusculas

    // Filtrar los productos por nombre y codigo
    this.productosFiltrados = this.productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search) ||
        p.codigo.toLowerCase().includes(search)
    );
  }

  eliminarProducto(id: number) {
    Swal.fire({
      title: '¿Estás seguro de que deseas eliminar este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminar(id);
      }
    });
  }

  eliminar(id: number) {
    this.servidor.eliminarProducto(id).subscribe({
      next: () => {
        this.productos = this.productos.filter((p) => p.id !== id);
        this.filtrarProductos();
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          text: 'El producto se eliminó correctamente',
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar producto',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }

  btnEditar(id: number) {
    this.router.navigate(['/editar-producto', id]);
  }
}