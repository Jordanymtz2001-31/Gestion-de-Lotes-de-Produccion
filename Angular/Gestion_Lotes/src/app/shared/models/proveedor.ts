export interface Proveedor {
    id?: number; // El ID suele ser opcional porque el servidor lo genera
    nombre: string;
    telefono: string;
    email: string;
}
