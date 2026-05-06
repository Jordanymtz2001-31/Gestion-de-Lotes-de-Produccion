import { HttpInterceptorFn } from "@angular/common/http"; // HttpInterceptorFn para crear interceptores

export const authInterceptor : HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('access_token'); // Obtenemos el token del localStorage
    
    // Verificamos si el token existe
    if (token) {
        // Clonamos la solicitud y le agregamos el token
        const reqConToken = req.clone({
            // Agregamos el token al header de la solicitud
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(reqConToken); // Devolvemos la solicitud con el token
    }
    return next(req); // Devolvemos la solicitud sin el token
}
