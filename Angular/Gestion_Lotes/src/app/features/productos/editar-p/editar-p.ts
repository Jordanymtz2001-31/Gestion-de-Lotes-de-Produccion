import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Producto, UNIDADES_MEDIDA } from '../../../shared/models/producto';
import { EditarProductoDto } from '../../../shared/models/productoDto';

@Component({
  selector: 'app-editar-p',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-p.html',
  styleUrl: './editar-p.css',
})
export class EditarP implements OnInit {

  //Cuando utilizamos una Interfaz tenemos que crear un objeto
  //Vamos a usar la interfaz EditarProductoDto, en esta casi si enviamos un id porque vamos a actualizar
  productoDto: EditarProductoDto = {
    id: 0,
    nombre: '',
    codigo: '',
    descripcion: '',
    unidad_medida: 'METRO',
  };

  loading = false;
  error = '';
  success = '';

  unidades = UNIDADES_MEDIDA; // Creamos una array constante de las unidades de medida que tenemos en el modelo

  // Solo para mostrar en pantalla — no se edita
  stockActual: number = 0;

  constructor(private servidor: Servidor, private router: Router, private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtenemos el id de la url
    this.productoDto.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productoDto.id) { // Si el id existe cargamos el producto
      this.cargarProducto();
    }
  }

  cargarProducto() {
    this.loading = true;
    this.servidor.buscarProducto(this.productoDto.id).subscribe({
      next: (producto) => {
        this.productoDto = producto;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar producto';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSubmit() {
    if (!this.productoDto.nombre || !this.productoDto.codigo) {
      this.error = 'El nombre y código son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.servidor.editarProducto(this.productoDto).subscribe({
      next: () => {
        this.success = 'Producto actualizado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-productos']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al actualizar producto';
        console.error(err);
      },
    });
  }
}