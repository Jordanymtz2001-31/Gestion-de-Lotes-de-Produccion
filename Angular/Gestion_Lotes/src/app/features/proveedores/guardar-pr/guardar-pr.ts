import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../../core/services/servidor';
import { Proveedor } from '../../../shared/models/proveedor';

@Component({
  selector: 'app-guardar-pr',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './guardar-pr.html',
  styleUrl: './guardar-pr.css',
})
export class GuardarPr {
  proveedor: Partial<Proveedor> = {
    nombre: '',
    telefono: '',
    email: '',
  };

  loading = false;
  error = '';
  success = '';

  constructor(
    private servidor: Servidor,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.proveedor.nombre || !this.proveedor.telefono || !this.proveedor.email) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.servidor.guardarProveedor(this.proveedor as Proveedor).subscribe({
      next: () => {
        this.success = 'Proveedor creado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/listar-proveedores']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear proveedor';
        console.error(err);
      },
    });
  }
}