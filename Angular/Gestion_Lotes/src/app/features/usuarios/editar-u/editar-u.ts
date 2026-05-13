import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { ROLES, Usuario } from '../../../shared/models/usuario';
import { EditarUsuarioDto } from '../../../shared/models/usuarioDto';

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
  success = '';

  roles = ROLES;

  constructor(private servidor: Servidor, private router: Router,private route: ActivatedRoute) {}

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
        this.loading = false; // Una vez cargado el usuario, ocultamos el spinner
      },
      error: (err) => {
        this.error = 'Error al cargar usuario';
        this.loading = false;
        console.error(err);
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
    this.success = '';

    /* No enviamos password en edición (solo en creación)
    const datosActualizar = {
      username: this.usuario.username,
      email: this.usuario.email,
      rol: this.usuario.rol
    };
    */

    this.servidor.editarUsuario(this.usuario).subscribe({
      next: () => {
        this.success = 'Usuario actualizado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-usuarios']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al actualizar usuario';
        console.error(err);
      },
    });
  }
}