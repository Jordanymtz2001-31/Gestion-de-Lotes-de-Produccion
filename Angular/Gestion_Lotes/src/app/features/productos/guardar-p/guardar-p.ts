import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { Producto, UNIDADES_MEDIDA } from '../../../shared/models/producto';
import { CrearProductoDto } from '../../../shared/models/productoDto';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-guardar-p',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './guardar-p.html',
  styleUrl: './guardar-p.css',
})
export class GuardarP {

  //Cuando utilizamos una Interfaz tenemos que crear un objeto
  //Vamos a usar la interfaz CrearProductoDto que solo enviamos ciertos campos al servidor
  productoDto: CrearProductoDto = {
    nombre: '',
    codigo: '',
    descripcion: '',
    unidad_medida: 'METRO',
  };

  // Las unidades vienen del modelo — un solo lugar para cambiarlas
  unidades = UNIDADES_MEDIDA;
  loading = false;
  error = '';

  constructor(private servidor: Servidor, private router: Router) {}
  
  onSubmit() {
    if (!this.productoDto.nombre || !this.productoDto.codigo) {
      this.error = 'El nombre y código son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';

    Swal.fire({
      title: '¿Confirmas la creación del producto?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crearlo',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarProducto();
      } else {
        this.loading = false;
      }
    });
  }

  guardarProducto() {
    this.servidor.guardarProducto(this.productoDto).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          text: 'El producto se creó correctamente',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          this.router.navigate(['/listar-productos']);
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al crear producto',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }
}