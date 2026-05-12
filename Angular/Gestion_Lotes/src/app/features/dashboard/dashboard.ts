import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/interceptors/authService';
import { Lote } from '../../shared/models/lote';
import { Servidor } from '../../core/services/servidor';

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

  // Creamos un array de lotes recientes que vien de la base de datos
  lotesRecientes: Lote[] = [];

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
    // Cargar productos usando el servicio
    this.service.listarProductos().subscribe({
      //next: (productos: any) => { Colocamos any para cuando no se conoce el tipo y que acepta cualquier cosa, lo malo que no me autocompleta
      next: (productos) => { // Solo colamos el nombre del dato ya que lo tipamos en el servicio
        console.log('Productos cargados:', productos);
        this.totalProductos = Array.isArray(productos) ? productos.length : 0;
      },
      error: (err) => { // 'err' es un objeto de HttpErrorResponse
        console.error('Error al cargar productos:', err);
      },
    });
    
    // Cargar lotes
    this.service.listarLotes().subscribe({
      //next: (lotes: Lote[]) => { // Colocamos Lote[] por que sabemos 100% que es un array que llegara
      next: (lotes) => {
        console.log('Lotes cargados:', lotes); // Para mostrar los lotes en la consola

        // Contamos todos los lotes y le asignamos la cantidad
        this.totalLotes = lotes.length;

        // Contamos los lotes por estado y le asignamos la cantidad con ayuda de las funciones filter)
        this.lotesRevision = lotes.filter(l => l.estado === 'REVISION').length;
        this.lotesAprobados = lotes.filter(l => l.estado === 'APROBADO').length;

        // Obtenemos los lotes recientes, tomamos los primeros 10
        this.lotesRecientes = lotes.slice(0, 10);
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
      },
    });
  }
}