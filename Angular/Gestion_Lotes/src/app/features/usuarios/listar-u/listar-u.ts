import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Servidor } from '../../../core/services/servidor';
import { Usuario } from '../../../shared/models/usuario';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-listar-u',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './listar-u.html',
  styleUrl: './listar-u.css',
})
export class ListarU implements OnInit {

  usuarios: Usuario[] = []; // Arreglo para almacenar los usuarios obtenidos del servidor
  usuariosFiltrados: Usuario[] = []; // Arreglo para almacenar los usuarios filtrados
  busqueda: string = ''; // Variable para almacenar la busqueda
  loading = false;
  error: string = '';

  constructor(private servidor: Servidor) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.error = '';

    this.servidor.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = Array.isArray(usuarios) ? usuarios : []; // Convertir a un array si no lo es (cuando no llega un array/ no llega nada/ llega null) y en caso que no lo sea poner un array vacio
        this.usuariosFiltrados = [...this.usuarios]; // Hacer una copia de los usuarios para que se muestren los usuarios filtrados
        this.loading = false;
      },
      error: (err) => {
        this.error = getMensajeError(err);
        this.loading = false;
      },
    });
  }

  filtrarUsuarios() {
    // Creamos una variable para almacenar la busqueda, y antes con el toLowerCase() es para que no se distinga entre mayusculas y minusculas
    const search = this.busqueda.toLowerCase(); // El toLowerCase() es para que no se distinga entre mayusculas y minusculas
    this.usuariosFiltrados = this.usuarios.filter(
      (u) =>
        u.username.toLowerCase().includes(search)// Filtrar los usuarios por username
    );
  }

  eliminarUsuario(id: number) {
    Swal.fire({
      title: '¿Estás seguro de que deseas eliminar este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminar(id);
      }
    });
  }

  eliminar(id: number) {
    this.servidor.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((u) => u.id !== id);
        this.filtrarUsuarios();
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: 'El usuario se eliminó correctamente',
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar usuario',
          text: getMensajeError(err),
          showConfirmButton: false,
          showCloseButton: true,
        });
      },
    });
  }
}