import { Usuario } from "./usuario";

//Interfaz para Usuario para crear, es decir lo que mandamos al servidor
export interface CrearUsuarioDto {
    //id: number; no lo mandamos al servidor por que el servidor lo genera
    username: string;
    email: string;
    rol: Usuario['rol']; //Reusamos la interfaz Usuario para el tipado estricto
    password: string;
}

//Interfaz para editar, en donde el id se envia
export interface EditarUsuarioDto extends CrearUsuarioDto {
    id: number;
}
