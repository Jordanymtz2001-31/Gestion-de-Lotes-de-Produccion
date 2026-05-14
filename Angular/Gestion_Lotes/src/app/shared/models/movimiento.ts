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

// Creamos un Arry para definir los destinos, pero sol los de salida por que los demas ya los genera el servidor
export const DESTINOS_SALIDA: { value: string; label: string }[] = [
    { value: 'PRODUCCION', label: 'Producción' },
    { value: 'VENTA', label: 'Venta' },
    { value: 'MUESTRA', label: 'Muestra' },
];