//Interface Producto, es decir vamos a recibir los datos del servidor con estos campos, mientras que los DTOS son lo que mandamos al servidor
export interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    unidad_medida: 'METRO' | 'KG' | 'ROLLO';  // tipado estric
    stock_actual: number;
}

// Creamos una array constante de las unidades de medida
//Esto para mostrar las unidades de medida en el select de crear y editar
export const UNIDADES_MEDIDA: { value: Producto['unidad_medida']; label: string }[] = [
    { value: 'METRO', label: 'Metro' },
    { value: 'KG',    label: 'Kilogramo' },
    { value: 'ROLLO', label: 'Rollo' },
];
