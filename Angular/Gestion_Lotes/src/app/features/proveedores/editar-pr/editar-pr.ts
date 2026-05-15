import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Proveedor } from '../../../shared/models/proveedor';
import { EditarProveedorDto } from '../../../shared/models/proveedorDto';
import Swal from 'sweetalert2';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-editar-pr',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './editar-pr.html',
  styleUrl: './editar-pr.css',
})
export class EditarPr implements OnInit {
  // Creamos un proveedor vacío
  proveedor: EditarProveedorDto = {
    id: 0,
    nombre: '',
    telefono: '',
    email: '',
  };

  loading = false;
  error = '';
  success = '';

  constructor(private servidor: Servidor, private router: Router, private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtenemos el id de la url
    this.proveedor.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.proveedor.id) { // Si el id existe cargamos el proveedor
      this.cargarProveedor();
    }
  }

  cargarProveedor() {
    this.loading = true;
    // Buscamos el proveedor
    this.servidor.buscarProveedor(this.proveedor.id).subscribe({
      next: (proveedor) => {
        this.proveedor = proveedor;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar proveedor';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSubmit() {
    if (!this.proveedor.nombre || !this.proveedor.telefono || !this.proveedor.email) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    Swal.fire({
      title: '¿Confirmas la edición del proveedor?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si editarlo',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false, // No permitir cerrar el modal haciendo clic fuera de ella
    }).then((result) => {
    if (result.isConfirmed) {
      this.editarProveedor();
    }
    });
  }
  
  editarProveedor() {
    
    this.loading = true;

    this.servidor.editarProveedor(this.proveedor).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor editado correctamente',
          showConfirmButton: false, // Ocultar el botón de confirmación
          timer: 2000, // Tiempo en milisegundos para cerrar el modal
        }).then(() => {
        this.router.navigate(['/listar-proveedores']);
        })
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al editar proveedor',
          text: getMensajeError(err), // Utiliza la función getMensajeError para obtener el mensaje de error
          showConfirmButton: false, // Ocultar el botón de confirmación
          showCloseButton: true // Boton de cerrar
        })
      },
    });
  }
}