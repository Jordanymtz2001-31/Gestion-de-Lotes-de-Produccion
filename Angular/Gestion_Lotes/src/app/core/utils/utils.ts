// Creamos una funcion para obtener el mensaje de error
// Esto por diferentes tipos de formato (APIs)

// Funciona para todos los servicios (APIs)
export function getMensajeError(err: any): string {

    if (!err.error) return 'Error desconocido';

    // Formato 1 - String directo
    if (typeof err.error === 'string') return err.error;

    //Formtato 2 - personalizado de la API (DRF O Django)
    if (err.error.error)  return err.error.error;
    if (err.error.detail) return err.error.detail;

    // Formato 3 - Errores de validación por campo
    if (typeof err.error === 'object') {
        return Object.entries(err.error) // Convierte el objeto en una matriz de pares clave-valor
            .map(([campo, mensajes]) => {
                const lista = Array.isArray(mensajes) ? mensajes.join(', ') : mensajes; // Si es un array, lo convierte en una cadena
                return `${campo}: ${lista}`; // Devuelve la cadena formateada
            })
            .join('\n'); // Une las cadenas con un salto de línea
    }
    return 'Error al procesar la solicitud';
}