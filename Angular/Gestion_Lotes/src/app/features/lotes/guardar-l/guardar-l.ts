import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Producto } from '../../../shared/models/producto';
import { Proveedor } from '../../../shared/models/proveedor';
import { CrearLoteDto } from '../../../shared/models/loteDto';

@Component({
  selector: 'app-guardar-l',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './guardar-l.html',
  styleUrl: './guardar-l.css',
})
export class GuardarL implements OnInit {

  // Creamos el lote
  lote: CrearLoteDto = {
    codigo_lote: '',
    producto_id: 0,
    proveedor_id: 0,
    cantidad_inicial: 0,
    cantidad_actual: 0,
    fecha_produccion: new Date(),
    estado: 'REVISION'
  };

  productos: Producto[] = []; // Lista de productos que llegan del servidor
  proveedores: Proveedor[] = []; // Lista de proveedores que llegan del servidor
  loading = false;
  error = '';
  success = '';

  constructor(private servidor: Servidor, private router: Router) {}

  ngOnInit() {
    this.cargarProductosProveedores();
  }

  cargarProductosProveedores() {
    this.servidor.listarProductos().subscribe({
      next: (productos) => {
        this.productos = Array.isArray(productos) ? productos : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
      },
      error: (err) => console.error('Error cargando productos', err)
    });

    this.servidor.listarProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = Array.isArray(proveedores) ? proveedores : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
      },
      error: (err) => console.error('Error cargando proveedores', err)
    });
  }

  onSubmit() {
    if (!this.lote.codigo_lote || !this.lote.producto_id || !this.lote.proveedor_id || !this.lote.cantidad_inicial) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';


    this.servidor.guardarLote(this.lote).subscribe({
      next: () => {
        this.success = 'Lote creado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-lotes']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear lote';
        console.error(err);
      },
    });
  }
}