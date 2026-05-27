import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/interceptors/authService';
import Swal from 'sweetalert2';
import { getMensajeError } from '../../../core/utils/utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  //errorMessage: string = '';

  constructor(private authService: AuthService,private router: Router) {}

  // Función para iniciar sesión en caso de que el formulario sea enviado  
  onSubmit() {
    /*
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }
    */

    this.loading = true; // Activar el indicador de carga
    //this.errorMessage = ''; // Limpiar el mensaje de error

    // Realizar la petición de inicio de sesión y le pasamos el username y password
    this.authService.login(this.username, this.password).subscribe({
      next: () => { 
        this.router.navigate(['/dashboard']); // Navegar a la pantalla de inicio en caso de inicio de sesión exitoso
      },
      error: (err) => {
        this.loading = false;
        //const mensajeError = err.error?.error || 'Credenciales inválidas'; //Toma el error del backend

        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: 'No se pudo autenticar el usuario, por favor verifique sus credenciales o intente nuevamente mas tarde', // Utiliza la función getMensajeError para obtener el mensaje de error
          showConfirmButton: false, // Ocultar el botón de confirmación
          timer: 9000, // Tiempo en milisegundos para cerrar el modal
          allowOutsideClick: false // No permitir cerrar el modal haciendo clic fuera de ella
      }).then(() => { // Entonces de cerrar el modal, limpiamos los campos
        this.username = '';
        this.password = '';
      })
      },
    });
  }
}