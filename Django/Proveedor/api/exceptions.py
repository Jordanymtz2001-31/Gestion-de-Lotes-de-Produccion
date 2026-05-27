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
        if isinstance(exc, Http404):
            response.data['detail'] = 'No se encontro el recurso solicitado'
    return response