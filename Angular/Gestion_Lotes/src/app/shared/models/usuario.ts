// IMPORTANTE

//Por que crear interfaces o clases? la interface es un contrato que le dice a typescript que va a tener un objeto con estas propiedades 
// asemos uso en los componentes ts.

//Colocamos export para que cualquier componente pueda acceder a la clase, de lo contrario no podria acceder

//El ! es para indicar que no es nulo, es decir que siempre va a tener un valor

// Pero es mejor usar interface por que la clase genera codigo JavaScript mientras que la interface solo existe en TypeScript
// Para mis modelo de datos la interface es mas eficiente

/*
export class Usuario {
    id!: number;
    username!: string;
    email!: string;
    rol!: string;
    password!: string;

}
*/

// Como es una interface TypeScript asume que todas las propiedades siemore tendran valores a menos que explicitamente le coloquemos ? para hacerlas opcionales
// El ! solo existe en las clases por que como se deben inicializar en el constructor y sino le damos valores iniciales se queja mientras que en las interfaces no se inicializan

//Solo describimos la estructura del objeto
export interface Usuario {
    id: number;
    username: string;
    email: string;
    rol: string;
    password: string;
}