from rest_framework.views import exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, AuthenticationFailed, ValidationError, NotFound
from django.http import Http404
from rest_framework import status

def custom_exception_handler(exc, context):
    
    #Llamos al hander original
    print(f"DEBUG: Ha ocurrido una excepción de tipo: {type(exc)}")
    response = exception_handler(exc, context)
    # exc es la exepcion que se ha producido y que se lanzara
    # context es la informacion de la peticion

    #Si la peticion es correcta, es decir que si la respuesta es None entonces devolvemos la respuesta
    if response is not None:
        if isinstance(exc, NotAuthenticated): # NotAuthenticated es cuando no esta autenticado
            response.data = {'error': 'No esta autenticado, Autenticacion Fallida'}
            response.status_code = status.HTTP_401_UNAUTHORIZED # Estatus 401 Credenciales no validadas
        elif isinstance(exc, AuthenticationFailed):
            response.data = {'error': 'Credenciales invalidas, Autenticacion Fallida'}
            response.status_code = status.HTTP_401_UNAUTHORIZED # Estatus 401 Credenciales no validadas
        elif isinstance(exc, PermissionDenied):
            response.data = {'error': 'Estas autenticado, pero no tienes permiso para realizar esta accion, Permiso Denegado'}
            response.status_code = status.HTTP_403_FORBIDDEN # Estatus 403 Credenciales validadas, pero no autorizado para la accion solicitada
        elif isinstance(exc, ValidationError):
            response.data = {'error': 'Datos no validos, falta de datos o caracteres invalidos'}
            response.status_code = status.HTTP_400_BAD_REQUEST
        elif isinstance(exc, Http404):
            response.data['detail'] = 'No se encontro el recurso solicitado'
        

    return response