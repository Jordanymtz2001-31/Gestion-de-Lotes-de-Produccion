export interface CrearMovimientoDto {
    lote: number;
    tipo: 'ENTRADA' | 'SALIDA';
    cantidad: number;
    destino: string | null;
    observaciones: string | null;
}