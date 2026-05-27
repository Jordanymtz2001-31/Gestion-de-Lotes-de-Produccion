import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../interceptors/authService';
import { inject } from '@angular/core';


// Metodos para validar que el usuario este logueado
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService); // Inyectamos el servicio de autenticación mediante la dependencia inject() sin usar el constructor
  const router = inject(Router); // Inyectamos el servicio de navegación mediante la dependencia inject() sin usar el constructor 

  if(!authService.estadoLogueado){ // Si no estamos logueados, redirigimos a la pantalla de login
    router.navigate(['/login']);
    return false;
  }

  return true; // Si estamos logueados, permitimos el acceso
};

// Metodos para validar que el usuario sea admin
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService); // Inyectamos el servicio de autenticación mediante la dependencia inject() sin usar el constructor
  const router = inject(Router); // Inyectamos el servicio de navegación mediante la dependencia inject() sin usar el constructor

  if(authService.rol === 'ADMIN'){  //Validamos que el rol sea admin
    return true;
  }
  router.navigate(['/dashboard']); // Si no es admin, redirigimos a la pantalla de dashboard
  return false;

}
