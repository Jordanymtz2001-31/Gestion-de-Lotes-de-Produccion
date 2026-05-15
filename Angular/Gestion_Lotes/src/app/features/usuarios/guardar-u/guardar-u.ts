import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { ROLES, Usuario } from '../../../shared/models/usuario';
import { CrearUsuarioDto } from '../../../shared/models/usuarioDto';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-guardar-u',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './guardar-u.html',
  styleUrl: './guardar-u.css',
})
export class GuardarU {
  //Creamos un objeto para guardar el usuario
  usuario: CrearUsuarioDto = {
    username: '',
    email: '',
    rol: 'OPERADOR',
    password: ''
  };

  loading = false;
  error = '';
  roles = ROLES;

  constructor(private servidor: Servidor, private router: Router) {}

  onSubmit() {
    if (!this.usuario.username || !this.usuario.email || !this.usuario.password) {
      this.error = 'Los campos username, email y password son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';

    Swal.fire({
      title: '¿Confirmas la creación del usuario?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crearlo',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarUsuario();
      } else {
        this.loading = false;
      }
    });
  }

  guardarUsuario() {
    this.servidor.guardarUsuario(this.usuario).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario se creó correctamente',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          this.router.navigate(['/listar-usuarios']);
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al crear usuario',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }
}