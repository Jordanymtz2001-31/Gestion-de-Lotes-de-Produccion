//Interfaz de lote para crear, en donde el id no se envia

import { Lote } from "./lote";

// Porque el id se genera automaticamente en el servicio
export interface CrearLoteDto {
    codigo_lote: string;
    producto_id: number;
    proveedor_id: number;
    cantidad_inicial: number;
    cantidad_actual: number;
    fecha_produccion: Date;
    estado: Lote['estado']; // Reutilizamos el tipo estricto
}

export interface EditarLoteDto extends CrearLoteDto {
    id: number; //Agregamos el id por que lo usaremos para editar
}
// Solo para cambiar el estado y mandarlo al backend 
export interface CambiarEstadoLoteDto {
    estado: Lote['estado']; // Reutilizamos el tipo estricto
    observaciones?: string; // opcional — solo se usa al rechazar
}