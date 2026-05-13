import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Proveedor } from '../../../shared/models/proveedor';
import { EditarProveedorDto } from '../../../shared/models/proveedorDto';

@Component({
  selector: 'app-editar-pr',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './editar-pr.html',
  styleUrl: './editar-pr.css',
})
export class EditarPr implements OnInit {
  // Creamos un proveedor vacío
  proveedor: EditarProveedorDto = {
    id: 0,
    nombre: '',
    telefono: '',
    email: '',
  };

  loading = false;
  error = '';
  success = '';

  constructor(
    private servidor: Servidor,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtenemos el id de la url
    this.proveedor.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.proveedor.id) { // Si el id existe cargamos el proveedor
      this.cargarProveedor();
    }
  }

  cargarProveedor() {
    this.loading = true;
    // Buscamos el proveedor
    this.servidor.buscarProveedor(this.proveedor.id).subscribe({
      next: (proveedor) => {
        this.proveedor = proveedor;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar proveedor';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSubmit() {
    if (!this.proveedor.nombre || !this.proveedor.telefono || !this.proveedor.email) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.servidor.editarProveedor(this.proveedor).subscribe({
      next: () => {
        this.success = 'Proveedor actualizado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-proveedores']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al actualizar proveedor';
        console.error(err);
      },
    });
  }
}