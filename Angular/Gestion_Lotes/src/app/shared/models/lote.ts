//Interface para lote, es decir lo que vamos a recibir del servidor

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

//Creamos un array constante de los estados del lote
//Esto oara mostrar los estados del lote en el select de crear y editar
export const ESTADOS_LOTE: { value: Lote['estado']; label: string }[] = [
    { value: 'REVISION', label: 'Revisión' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'AGOTADO', label: 'Agotado' },
];
