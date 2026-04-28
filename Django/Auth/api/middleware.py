from django.http import JsonResponse
from rest_framework import status

# Definimos rutas publicas que no requieren autenticacion
RUTAS_PUBLICAS = ['/health/', '/usuario/login/', '/usuario/verify/']

# Clase Middleware para validar los headers de la peticion en donde se pasa el token (X-User-ID y X-User-Rol)
class GatewayAuthMiddleware:

    # Constructor
    def __init__(self, get_response):
        
        self.get_response = get_response

    # Metodos principal del middleware
    def __call__(self, request):
        print(f"HEADERS RECIBIDOS: {request.headers}")
        print(f"PATH: {request.path}")          
        print(f"RUTAS_PUBLICAS: {RUTAS_PUBLICAS}")  

        # Si la peticion es una ruta publica no requiere autenticacion
        if request.path in RUTAS_PUBLICAS:
            return self.get_response(request) # Pasamos el request al siguiente middleware
        
        user_id = request.headers.get('X-User-ID', '').strip()
        user_rol = request.headers.get('X-User-Rol', '').strip()

        # Validamos
        # Si no vienen los headers, si la peticion no paso por el API Gateway
        if not user_id or not user_rol:
            return JsonResponse({'error': 'Acceso denegado'}, status=status.HTTP_401_UNAUTHORIZED)

        # Los inyectamos en el request para que puedan ser utilizados en las vistas
        request.user_id = user_id
        request.user_rol = user_rol

        # Pasamos la peticion
        return self.get_response(request)

