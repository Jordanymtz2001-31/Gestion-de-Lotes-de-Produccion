import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { Producto } from '../../../shared/models/producto';
import { Proveedor } from '../../../shared/models/proveedor';
import { CrearLoteDto } from '../../../shared/models/loteDto';
import { getMensajeError } from '../../../core/utils/utils';

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

    Swal.fire({
      title: '¿Confirmas la creación del lote?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crearlo',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarLote();
      } else {
        this.loading = false;
      }
    });
  }

  guardarLote() {
    this.servidor.guardarLote(this.lote).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Lote creado',
          text: 'El lote se creó correctamente',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          this.router.navigate(['/listar-lotes']);
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al crear lote',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }
}