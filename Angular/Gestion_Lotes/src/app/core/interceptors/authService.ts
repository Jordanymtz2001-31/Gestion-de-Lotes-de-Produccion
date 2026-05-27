import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  /**
   * URL base del API (API Gateway). Se añade la barra final para facilitar
   * la concatenación de rutas como `${this.apiUrl}usuario/login/`.
   */
  private apiUrl = 'http://localhost:8080/';

  /**
   * `Signal` que mantiene el usuario actualmente autenticado.
   *
   * - Es reactivo: los componentes que lean esta signal recibirán actualizaciones
   *   cuando cambie (por ejemplo tras el login o logout).
   * - Inicialmente `null` cuando no hay sesión en memoria.
   */
  usuarioActual = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Al crear el servicio, intentamos restaurar el usuario desde localStorage en caso de estar logueado previamente
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      // Si hay datos en localStorage, los parseamos y los colocamos en la signal
      this.usuarioActual.set(JSON.parse(usuario));
    }
  }

  /**
   * Realiza el login contra el endpoint `/usuario/login/`.
   *
   * - Recibe `username` y `password` y devuelve el observable de la petición HTTP.
   * - En el `tap` (efecto secundario) guarda el `access_token` y el `user`
   *   en `localStorage`, y actualiza la `signal` `usuarioActual`.
   *
   * Uso: `authService.login('u','p').subscribe(...)`.
   */
  login(username: string, password: string) {
    return this.http.post(this.apiUrl + 'usuario/login/', { username, password })
      .pipe(
        tap((response: any) => {
          // Guardamos el token para el interceptor y el usuario para restaurar sesión
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('usuario', JSON.stringify(response.user));
          // Actualizamos la signal; cualquier componente lector se actualizará
          this.usuarioActual.set(response.user);
        })
      );
  }

  /**
   * Cierra la sesión localmente: borra token/usuario y navega a la página de login.
   *
   * - No hace logout remoto en el backend; sólo limpia estado cliente.
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Getter reactivo para el rol del usuario actual.
   * - Devuelve `''` si no hay usuario.
   */
  get rol(): string {
    return this.usuarioActual()?.rol || '';
  }

  /**
   * Indica si hay un token de acceso guardado (estado "logueado" simple).
   *
   * Nota: esto sólo comprueba existencia de token local; no valida expiración.
   */
  get estadoLogueado(): boolean {
    //El "!!" es para que devuelva true o false
    return !!localStorage.getItem('access_token');
  }
}
