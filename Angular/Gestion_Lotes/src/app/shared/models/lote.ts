export interface Lote {
    id: number;
    codigo_lote: string;
    producto_id: number;
    proveedor_id: number;
    cantidad_inicial: number;
    cantidad_actual: number;
    fecha_produccion: Date;
    fecha_entrada: Date;
    estado: 'REVISION' | 'APROBADO' | 'RECHAZADO' | 'AGOTADO';
}
