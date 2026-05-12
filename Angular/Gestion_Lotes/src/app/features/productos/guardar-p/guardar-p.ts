import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Producto, UNIDADES_MEDIDA } from '../../../shared/models/producto';
import { CrearProductoDto } from '../../../shared/models/productoDto';

@Component({
  selector: 'app-guardar-p',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './guardar-p.html',
  styleUrl: './guardar-p.css',
})
export class GuardarP {

  //Cuando utilizamos una Interfaz tenemos que crear un objeto
  //Vamos a usar la interfaz CrearProductoDto que solo enviamos ciertos campos al servidor
  productoDto: CrearProductoDto = {
    nombre: '',
    codigo: '',
    descripcion: '',
    unidad_medida: 'METRO',
  };

  // Las unidades vienen del modelo — un solo lugar para cambiarlas
  unidades = UNIDADES_MEDIDA;

  loading = false;
  error = '';
  success = '';

  constructor(private servidor: Servidor, private router: Router) {}
  
  onSubmit() {
    if (!this.productoDto.nombre || !this.productoDto.codigo) {
      this.error = 'El nombre y código son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.servidor.guardarProducto(this.productoDto).subscribe({
      next: () => {
        this.success = 'Producto creado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-productos']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear producto';
        console.error(err);
      },
    });
  }
}