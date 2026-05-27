//Interfaz Dtos para proveedor, es decir lo que mandamos al servidor
export interface CrearProveedorDto {
    //id: number; no por que lo genera el backend
    nombre: string;
    telefono: string;
    email: string;
}


//Interfaz Dtos para editar proveedor
export interface EditarProveedorDto extends CrearProveedorDto {
    id: number; // Si es necesario
}