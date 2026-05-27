import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../../shared/models/producto';
import { Usuario } from '../../shared/models/usuario';
import { Observable } from 'rxjs';
import { Proveedor } from '../../shared/models/proveedor';
import { Lote } from '../../shared/models/lote';
import { CrearProductoDto, EditarProductoDto } from '../../shared/models/productoDto';
import { CrearUsuarioDto, EditarUsuarioDto } from '../../shared/models/usuarioDto';
import { CrearProveedorDto, EditarProveedorDto } from '../../shared/models/proveedorDto';
import { CambiarEstadoLoteDto, CrearLoteDto, EditarLoteDto } from '../../shared/models/loteDto';
import { Movimiento } from '../../shared/models/movimiento';
import { CrearMovimientoDto } from '../../shared/models/movimientoDto';

@Injectable({
  providedIn: 'root',
})
export class Servidor {

  //Creamos un constructor
  constructor(private http: HttpClient) {} // Inyectamos HttpClient

  //Creamos una variable
  private BASE_ULR = 'http://localhost:8080'; // Creamos la url del API Gateway
  
  //Observable nos permite observar todas las respuestas del servidor
  //Podemos o no usas el Observable para tipar las respuestas
  //LA MEJOR PRACTICA ES USAR HttpResponse<T> para tipar la respuesta

  //-------------------------------------------USUARIOS -----------------------------------------------------------
  listarUsuarios() {
    return this.http.get<Usuario[]>(this.BASE_ULR + '/usuario/'); // Esperamos una lista de usuarios
  }

  guardarUsuario(usuario: CrearUsuarioDto) {
    return this.http.post<Usuario>(this.BASE_ULR + '/usuario/', usuario); // Esperamos un Usuario
  }

  editarUsuario(usuario: EditarUsuarioDto) {
    return this.http.patch<Usuario>(this.BASE_ULR + '/usuario/' + usuario.id + '/', usuario); // Esperamos un usuario editado
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

  guardarProducto(productoDto: CrearProductoDto) {
    return this.http.post<Producto>(this.BASE_ULR + '/productos/', productoDto); // Esperamos un Producto
  }

  editarProducto(productoDto: EditarProductoDto) {
    return this.http.patch<Producto>(this.BASE_ULR + '/productos/' + productoDto.id + '/', productoDto); // Esperamos un producto editado
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
  
  guardarProveedor(proveedor: CrearProveedorDto) {
    return this.http.post<Proveedor>(this.BASE_ULR + '/proveedores/', proveedor); // Esperamos un Proveedor
  }

  editarProveedor(proveedor: EditarProveedorDto) {
    return this.http.patch<Proveedor>(this.BASE_ULR + '/proveedores/' + proveedor.id + '/', proveedor); // Esperamos un proveedor editado
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

  guardarLote(lote: CrearLoteDto) {
    return this.http.post<Lote>(this.BASE_ULR + '/lotes/', lote); // Esperamos un Lote
  }

  // Metodo para solo cambiar el estado del lote
  editarEstadoLote(id: number, lote: CambiarEstadoLoteDto) {
    return this.http.patch<Lote>(this.BASE_ULR + '/lotes/' + id + '/', lote); // Esperamos un lote editado
  }

  eliminarLote(id: number) {
    return this.http.delete<void>(this.BASE_ULR + '/lotes/' + id + '/');
  }

  //----------------------------------------------------------MOVIMIENTOS--------------------------------------------------------------
  listarMovimientos() {
    return this.http.get<Movimiento[]>(this.BASE_ULR + '/movimientos/');
  }

  registrarMovimiento(movimiento: CrearMovimientoDto) {
    return this.http.post<Movimiento>(this.BASE_ULR + '/movimientos/', movimiento);
  }
}
