import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../../shared/models/producto';
import { Usuario } from '../../shared/models/usuario';
import { Observable } from 'rxjs';
import { Proveedor } from '../../shared/models/proveedor';
import { Lote } from '../../shared/models/lote';

@Injectable({
  providedIn: 'root',
})
export class Productos {

  //Creamos un constructor
  constructor(private http: HttpClient) {} // Inyectamos HttpClient

  //Creamos una variable
  private BASE_ULR = 'http://localhost:8080/'; // Creamos la url del API Gateway
  
  //Observable nos permite observar todas las respuestas del servidor
  //Podemos o no usas el Observable para tipar las respuestas
  //LA MEJOR PRACTICA ES USAR HttpResponse<T> para tipar la respuesta

  //-------------------------------------------USUARIOS -----------------------------------------------------------
  listarUsuarios() {
    return this.http.get<Usuario[]>(this.BASE_ULR + '/usuario/'); // Esperamos una lista de usuarios
  }

  guardarUsuario(usuario: Usuario) {
    return this.http.post<Usuario>(this.BASE_ULR + '/usuario/', usuario); // Esperamos un Usuario
  }

  editarUsuario(id: number, usuario: Usuario) {
    return this.http.patch<Usuario>(this.BASE_ULR + '/usuario/' + id + '/', usuario); // Esperamos un usuario editado
  }

  eliminarUsuario(id: number) {
    return this.http.delete<void>(this.BASE_ULR + '/usuario/' + id + '/'); // colocamos el void por que no esperamos un body solo un estaus 204 que significa que se elimino en el backend
  }                                                                 // La resputa de eliminacion lo manejare en el componente

  buscarUsuario(id: number) {
    return this.http.get<Usuario>(this.BASE_ULR + '/usuario/' + id + '/'); // Esperamos un usuario
  }
  //--------------------------------------------PRODUCTOS -----------------------------------------------------------
  listarProductos() {
    return this.http.get<Producto[]>(this.BASE_ULR + '/productos/'); // Esperamos una lista de productos
  }

  guardarProducto(producto: Producto) {
    return this.http.post<Producto>(this.BASE_ULR + '/productos/', producto); // Esperamos un Producto
  }

  editarProducto(id: number, producto: Producto) {
    return this.http.patch<Producto>(this.BASE_ULR + '/productos/' + id + '/', producto); // Esperamos un producto editado
  }

  eliminarProducto(id: number) {
    return this.http.delete<void>(this.BASE_ULR + '/productos/' + id + '/'); // colocamos el void por que no esperamos un body solo un estaus 204 que significa que se elimino en el backend
  }                                                                 // La resputa de eliminacion lo manejare en el componente

  buscarProducto(id: number) {
    return this.http.get<Producto>(this.BASE_ULR + '/productos/' + id + '/'); // Esperamos un producto
  }

  //--------------------------------------------PROVEEDORES -----------------------------------------------------------
  listarProveedores() {
    return this.http.get<Proveedor[]>(this.BASE_ULR + '/proveedores/'); // Esperamos una lista de proveedores
  }
  
  guardarProveedor(proveedor: Proveedor) {
    return this.http.post<Proveedor>(this.BASE_ULR + '/proveedores/', proveedor); // Esperamos un Proveedor
  }

  editarProveedor(id: number, proveedor: Proveedor) {
    return this.http.patch<Proveedor>(this.BASE_ULR + '/proveedores/' + id + '/', proveedor); // Esperamos un proveedor editado
  }

  eliminarProveedor(id: number) {
    return this.http.delete<void>(this.BASE_ULR + '/proveedores/' + id + '/'); // colocamos el void por que no esperamos un body solo un estaus 204 que significa que se elimino en el backend
  }                                                                 // La resputa de eliminacion lo manejare en el componente

  buscarProveedor(id: number) {
    return this.http.get<Proveedor>(this.BASE_ULR + '/proveedores/' + id + '/'); // Esperamos un proveedor
  }

  //----------------------------------------------------------LOTES--------------------------------------------------------------
  listarLotes() {
    return this.http.get<Lote[]>(this.BASE_ULR + '/lotes/'); // Esperamos una lista de lotes
  }

  guardarLote(lote: Lote) {
    return this.http.post<Lote>(this.BASE_ULR + '/lotes/', lote); // Esperamos un Lote
  }

  editarLote(id: number, lote: Lote) {
    return this.http.patch<Lote>(this.BASE_ULR + '/lotes/' + id + '/', lote); // Esperamos un lote editado
  }

  eliminarLote(id: number) {
    return this.http.delete<void>(this.BASE_ULR + '/lotes/' + id + '/'); // colocamos el void por que no esperamos un body solo un estaus 204 que significa que se elimino en el backend
  }                                                                 // La resputa de eliminacion lo manejare en el componente
}
