import { Producto } from "./producto";


// Para crear — sin id ni stock_actual - es decir lo que mandamos al servidor
export interface CrearProductoDto {
    nombre: string;
    codigo: string;
    descripcion: string;
    unidad_medida: Producto['unidad_medida'];  // reutiliza el tipo estricto
}

// Para editar — todo igual pero id requerido
export interface EditarProductoDto extends CrearProductoDto {
    id: number;
}