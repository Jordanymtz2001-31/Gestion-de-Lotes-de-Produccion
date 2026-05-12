import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/interceptors/authService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Gestion_Lotes');

  // Inyectamos el servicio de autenticación y el router
  constructor(public authService: AuthService, private router: Router
  ) {}

  // Función para cerrar la sesión
  logout() {
    this.authService.logout();
  }
}