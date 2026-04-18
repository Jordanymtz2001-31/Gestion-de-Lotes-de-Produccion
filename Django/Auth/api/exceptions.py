from rest_framework.views import exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, AuthenticationFailed
from rest_framework import status

def custom_exception_handler(exc, context):
    
    #Llamos al hander original
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

    return response