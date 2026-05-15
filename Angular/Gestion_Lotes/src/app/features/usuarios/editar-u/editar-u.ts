import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { ROLES, Usuario } from '../../../shared/models/usuario';
import { EditarUsuarioDto } from '../../../shared/models/usuarioDto';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-editar-u',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './editar-u.html',
  styleUrl: './editar-u.css',
})
export class EditarU implements OnInit {

  // Creamos un objeto para almacenar los datos del usuario
  usuario: EditarUsuarioDto = {
    id: 0,
    username: '',
    email: '',
    rol: 'OPERADOR',
    password: ''
  };

  loading = false;
  error = '';
  roles = ROLES;

  constructor(private servidor: Servidor, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtenemos el id de la url
    this.usuario.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.usuario.id) { // Si el id existe cargamos el usuario
      this.cargarUsuario();
    }
  }

  cargarUsuario() {
    this.loading = true;
    // Buscamos el usuario por id en el backend
    this.servidor.buscarUsuario(this.usuario.id).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.loading = false;
      },
      error: (err) => {
        this.error = getMensajeError(err);
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (!this.usuario.username || !this.usuario.email) {
      this.error = 'Los campos username y email son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';

    Swal.fire({
      title: '¿Confirmas la actualización del usuario?',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.actualizarUsuario();
      } else {
        this.loading = false;
      }
    });
  }

  actualizarUsuario() {
    this.servidor.editarUsuario(this.usuario).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'El usuario se actualizó correctamente',
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
          title: 'Error al actualizar usuario',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }
}