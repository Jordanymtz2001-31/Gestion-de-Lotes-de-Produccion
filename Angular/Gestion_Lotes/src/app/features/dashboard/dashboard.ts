import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/interceptors/authService';
import { Lote } from '../../shared/models/lote';
import { Servidor } from '../../core/services/servidor';
import { Producto } from '../../shared/models/producto';
import { getMensajeError } from '../../core/utils/utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  usuario: any = null; // Usuario actual
  fechaActual = new Date(); // Fecha actual

  // Contadores
  totalProductos = 0;
  totalLotes = 0;
  lotesRevision = 0;
  lotesAprobados = 0;
  lotesAgotados = 0;
  lotesStockBajo = 0;

  errores: string[] = []; // Creamos un array de errores para mostrarlos en la vista

  // Creamos un array de lotes recientes que vien de la base de datos
  lotesRecientes: Lote[] = [];
  productos: Producto [] = []; // Array de productos que vienen de la base de datos

  constructor(private authService: AuthService, private service: Servidor) {}

  // Getter para verificar si el usuario es admin
  get esAdmin(): boolean {
    return this.authService.rol === 'ADMIN';
  }

  ngOnInit() {
    // Cargar usuario actual
    this.usuario = this.authService.usuarioActual();
    
    // Imprimir token en consola
    const token = localStorage.getItem('access_token');
    console.log('Token:', token);
    console.log('Usuario:', this.usuario);
    
    //Cargamos los datos ListaProductos y ListaLotes
    this.cargarDatos();
  }

  cargarDatos() {

    // Hacemos una petición para obtener los productos y lotes en paralelo
    // Con forkJoin() podemos realizar varias peticiones en paralelo
    forkJoin({
      productos: this.service.listarProductos().pipe(
        catchError(() => {
          this.errores.push('No se pudo cargar productos'); 
          return of([]) // Si la petición falla, devolvemos un array vacío
        }),
      ),
      lotes: this.service.listarLotes().pipe(
        catchError(() => {
          this.errores.push('No se pudo cargar lotes'); 
          return of([])
      }),
      ),
    }).subscribe({
      next: (data) => {
        this.productos = Array.isArray(data.productos) ? data.productos : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.totalProductos = this.productos.length;

        const lotes = Array.isArray(data.lotes) ? data.lotes : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.totalLotes = lotes.length;
        this.lotesRevision = lotes.filter(l => l.estado === 'REVISION').length;
        this.lotesAprobados = lotes.filter(l => l.estado === 'APROBADO').length;
        this.lotesAgotados = lotes.filter(l => l.estado === 'AGOTADO').length;
        this.lotesStockBajo = lotes.filter(l => 
          l.estado === 'APROBADO' && l.cantidad_actual > 0 && l.cantidad_actual < 10
        ).length;
        this.lotesRecientes = lotes.slice(0, 10);
      },
      error: (err) => {
        this.errores.push('Error al cargar datos');
      },
    });
  }

    // Para cerrar un error individual
  cerrarError(index: number) {
    this.errores.splice(index, 1);
  }

  // Función para obtener el nombre de un producto dado su ID
  getProductoNombre(productoId: number): string {
    if (!this.productos.length) return 'No se pudo cargar productos';
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.nombre || `Producto ${productoId}`;
  }
}