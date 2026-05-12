import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Proveedor } from '../../../shared/models/proveedor';

@Component({
  selector: 'app-editar-pr',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-pr.html',
  styleUrl: './editar-pr.css',
})
export class EditarPr implements OnInit {
  proveedor: Partial<Proveedor> = {
    nombre: '',
    telefono: '',
    email: '',
  };

  loading = false;
  error = '';
  success = '';
  proveedorId!: number;

  constructor(
    private servidor: Servidor,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.proveedorId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.proveedorId) {
      this.cargarProveedor();
    }
  }

  cargarProveedor() {
    this.loading = true;
    this.servidor.buscarProveedor(this.proveedorId).subscribe({
      next: (data) => {
        this.proveedor = data;
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

    this.servidor.editarProveedor(this.proveedorId, this.proveedor as Proveedor).subscribe({
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