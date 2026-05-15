import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Proveedor } from '../../../shared/models/proveedor';
import { CrearProveedorDto } from '../../../shared/models/proveedorDto';
import Swal from 'sweetalert2';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-guardar-pr',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './guardar-pr.html',
  styleUrl: './guardar-pr.css',
})
export class GuardarPr {
  // Crear proveedor
  proveedor: CrearProveedorDto = {
    nombre: '',
    telefono: '',
    email: '',
  };

  loading = false;
  error = '';

  constructor(private servidor: Servidor, private router: Router) {}

  onSubmit() {
    if (!this.proveedor.nombre || !this.proveedor.telefono || !this.proveedor.email) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    Swal.fire({
      title: '¿Confirmas la creación del proveedor?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si crearlo',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false, // No permitir cerrar el modal haciendo clic fuera de ella
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarProveedor();
      }
    });
  }

  guardarProveedor() {
    
    this.loading = true;

    this.servidor.guardarProveedor(this.proveedor).subscribe({
      next: () => {
        //this.success = 'Proveedor creado correctamente';
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado correctamente',
          showConfirmButton: false, // Ocultar el botón de confirmación
          timer: 2000, // Tiempo en milisegundos para cerrar el modal
        }).then(() => {
            this.router.navigate(['/listar-proveedores']);
          });
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al crear proveedor',
          text: getMensajeError(err), // Utiliza la función getMensajeError para obtener el mensaje de error'Error al crear proveedor',
          showConfirmButton: false, // Ocultar el botón de confirmación
          showCloseButton: true // Boton de cerrar
        }).then(() => { // Entonces de cerrar el modal, limpiamos los campos
          this.proveedor = {
            nombre: '',
            telefono: '',
            email: '',
          };
        })
      },
    });
  }
}