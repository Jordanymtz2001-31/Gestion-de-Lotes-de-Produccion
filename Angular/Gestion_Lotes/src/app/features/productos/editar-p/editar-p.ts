import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { Producto, UNIDADES_MEDIDA } from '../../../shared/models/producto';
import { EditarProductoDto } from '../../../shared/models/productoDto';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-editar-p',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-p.html',
  styleUrl: './editar-p.css',
})
export class EditarP implements OnInit {

  //Cuando utilizamos una Interfaz tenemos que crear un objeto
  //Vamos a usar la interfaz EditarProductoDto, en esta casi si enviamos un id porque vamos a actualizar
  productoDto: EditarProductoDto = {
    id: 0,
    nombre: '',
    codigo: '',
    descripcion: '',
    unidad_medida: 'METRO',
  };

  loading = false;
  error = '';
  unidades = UNIDADES_MEDIDA;
  stockActual: number = 0;

  constructor(private servidor: Servidor, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtenemos el id de la url
    this.productoDto.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productoDto.id) { // Si el id existe cargamos el producto
      this.cargarProducto();
    }
  }

  cargarProducto() {
    this.loading = true;
    this.servidor.buscarProducto(this.productoDto.id).subscribe({
      next: (producto) => {
        this.productoDto = producto;
        this.loading = false;
      },
      error: (err) => {
        this.error = getMensajeError(err);
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (!this.productoDto.nombre || !this.productoDto.codigo) {
      this.error = 'El nombre y código son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';

    Swal.fire({
      title: '¿Confirmas la actualización del producto?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.actualizarProducto();
      } else {
        this.loading = false;
      }
    });
  }

  actualizarProducto() {
    this.servidor.editarProducto(this.productoDto).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          text: 'El producto se actualizó correctamente',
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
          title: 'Error al actualizar producto',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }
}