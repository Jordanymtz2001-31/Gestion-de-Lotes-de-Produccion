export interface Movimiento {
    id: number;
    lote: number;
    usuario_id: number;
    tipo: 'ENTRADA' | 'SALIDA';
    cantidad: number;
    destino: string | null; // Opcional por que no todos los movimientos tienen destino (Al entrar un lote no tiene destino)
    observaciones: string | null;
    fecha: Date;
}

// Creamos un Arry para definir los destinos, pero solo los de salida por que los demas ya los genera el servidor
export const DESTINOS_SALIDA: { value: string; label: string }[] = [
    { value: 'PRODUCCION', label: 'Producción' },
    { value: 'VENTA', label: 'Venta' },
    { value: 'MUESTRA', label: 'Muestra' },
    { value: 'DEVOLUCION_PROV', label: 'Devolución a proveedor' },
];

export const DESTINOS_ENTRADA: { value: string; label: string }[] = [
    { value: 'COMPRA', label: 'Compra' },
    { value: 'INGRESO_ALMACEN', label: 'Ingreso al almacén' },
];

// Creamos un Arry para definir todos los destinos para filtros
export const TODOS_DESTINOS: { value: string; label: string }[] = [
    { value: 'PRODUCCION', label: 'Producción' },
    { value: 'VENTA', label: 'Venta' },
    { value: 'MUESTRA', label: 'Muestra' },
    { value: 'DEVOLUCION_PROV', label: 'Devolución a proveedor' },
    { value: 'COMPRA', label: 'Compra' },
    { value: 'INGRESO_ALMACEN', label: 'Ingreso al almacén' },
];

export const TIPOS_MOVIMIENTO: { value: string; label: string }[] = [
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SALIDA', label: 'Salida' },
];