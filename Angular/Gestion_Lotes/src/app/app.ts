import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/interceptors/authService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Gestion_Lotes');

  constructor(private authService: AuthService, private router: Router) {}

  //Creamos los metodos de navegacion que se usan en el html

  //LISTAR -----------------------------------------------------------
  listarUsuarios() {
    this.router.navigate(['listar-usuarios']);
  }

  listarProductos() {
    this.router.navigate(['listar-productos']);
  }

  listarProveedores() {
    this.router.navigate(['listar-proveedores']);
  }

  listarLotes() {
    this.router.navigate(['listar-lotes']);
  }

  //GUARDAR -----------------------------------------------------------
  guardarUsuarios() {
    this.router.navigate(['guardar-usuario']);
  }

  guardarProductos() {
    this.router.navigate(['guardar-producto']);
  }

  guardarProveedores() {
    this.router.navigate(['guardar-proveedor']);
  }

  guardarLotes() {
    this.router.navigate(['guardar-lote']);
  }

  //EDITAR -----------------------------------------------------------
  editarUsuarios() {
    this.router.navigate(['editar-usuario']);
  }

  editarProductos() {
    this.router.navigate(['editar-producto']);
  }

  editarProveedores() {
    this.router.navigate(['editar-proveedor']);
  }

}
