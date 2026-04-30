from django.http import JsonResponse
from rest_framework import status

#Clase Middleware para validar los headers
class GatewayAuthMiddleware:

    # Constructor para instanciar una sola ves el middleware al ejecutar
    # y esperar peticiones
    def __init__(self, respuesta):
        self.get_response = respuesta

    # Por cada peticion que llega, django llama a este metodo
    def __call__(self, request):
        
        usuario_id = request.headers.get('X-User-ID', '').strip()
        usuario_rol = request.headers.get('X-User-Rol', '').strip()

        # Validamos
        # Si no vienen los headers, si la peticion no paso por el API Gateway
        if not usuario_id or not usuario_rol:
            return JsonResponse({'error': 'Acceso denegado'}, status=status.HTTP_401_UNAUTHORIZED)

        # Los inyectamos en el request para que puedan ser utilizados en las vistas
        request.user_id = usuario_id
        request.user_rol = usuario_rol
        
        # Pasamos la peticion a la vista
        return self.get_response(request)