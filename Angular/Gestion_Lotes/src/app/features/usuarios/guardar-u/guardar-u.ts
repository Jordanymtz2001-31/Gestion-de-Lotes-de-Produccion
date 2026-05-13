import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { ROLES, Usuario } from '../../../shared/models/usuario';
import { CrearUsuarioDto } from '../../../shared/models/usuarioDto';

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
  success = '';

  roles = ROLES

  constructor(private servidor: Servidor, private router: Router) {}

  onSubmit() {
    if (!this.usuario.username || !this.usuario.email || !this.usuario.password) {
      this.error = 'Los campos username, email y password son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.servidor.guardarUsuario(this.usuario).subscribe({
      next: () => {
        this.success = 'Usuario creado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-usuarios']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear usuario';
        console.error(err);
      },
    });
  }
}