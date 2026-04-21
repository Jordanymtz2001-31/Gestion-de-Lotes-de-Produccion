from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework import status
from django.contrib.auth import authenticate
from django.conf import settings
from django.http import JsonResponse
from api.serializers import UsuarioSerializer, LoginSerializer
from api.permissions import Is_Admin
from api.models import Usuario

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    #Definimos permisos
    permission_classes = [IsAuthenticated, Is_Admin]

    """
    #Metodo para crear un usuario nuevo
    def get_serializer_class(self):
        if self.action == 'create':
            return RegistrarUsuarioSerializer
        return UsuarioSerializer

    # Metodo para crear un usuario: sólo administradores (comparación case-insensitive)
    def create(self, request, *args, **kwargs):
        #Usamos getattr para obtener el rol del usuario y lo convertimos a mayúsculas
        user_rol = (getattr(request.user, 'rol', '') or '').upper()
        if user_rol != 'ADMIN':
            return Response({'error': 'Solo administradores pueden crear usuarios'}, status=status.HTTP_403_FORBIDDEN)
            #raise PermissionDenied()
        return super().create(request, *args, **kwargs)
    """

# Clase para la vista de inicio de sesión
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data) # Recibe los datos del formulario
        if serializer.is_valid(): # Si los datos son validos

            #El validated_data es para obtener los datos validados
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)
            if user is None: # Si el usuario no existe
                # Dejar que el handler de excepciones personalizado construya
                # la respuesta consistente para AuthenticationFailed
                raise AuthenticationFailed()

            #Si el usuario existe, creamos el token (solo access, sin refresh)
            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'rol': user.rol
                }
            })
            
        # Si los datos no son validos, lo ma
        raise ValidationError(serializer.errors)
        #return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista para verificar token y exponer headers usados por nginx (X-User-ID, X-User-Rol)
class VerifyView(APIView):#
    permission_classes = [AllowAny]

    #Creamos dos metodos que estaran expuestos
    #Se exponen ambos para cubrir distintos escenarios de subrequest o pruebas
    
    def get(self, request):
        return self._verify(request)

    def post(self, request):
        return self._verify(request)

    # Metodo privado para verificar el token
    def _verify(self, request):

        # Obtenemos el token del header y lo limpiamos el prefijo Bearer
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()

        if not token: # Si el token no existe
            return JsonResponse({}, status=status.HTTP_401_UNAUTHORIZED) # Retornamos un error

        try:
            # Primero decodificamos el token con ayuda de TokenBackend de rest_framework_simplejwt
            # El metodo espera un algoritmo y una clave de firma
            tb = TokenBackend(algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
                                signing_key=settings.SIMPLE_JWT.get('SIGNING_KEY', settings.SECRET_KEY)) 
            
            # En una variable le pasamos el token y verificamos
            payload = tb.decode(token, verify=True)

            # Nginx leerá estos headers y los inyectará al servicio destino
            response = JsonResponse({}, status=status.HTTP_200_OK)

            # Si le decodificamos el token con exito, se lee el payload user_id y rol y se colocan en los headers
            response['X-User-ID'] = str(payload.get('user_id', '')) # Convertimos el user_id a string
            response['X-User-Rol'] = payload.get('rol', '') # Convertimos el rol a string

            return response # Devolvemos esos headers y cuerpo vacio junto con un status 200

            """
            nginx con auth_request no busca el body; solo inspecciona el código de estado para permitir/rechazar la petición 
            y puede leer headers de la subrequest (convertidos a variables upstream). Al devolver los valores 
            en headers, nginx puede pasarlos al backend destino con proxy_set_header X-User-ID $user_id; etc.
            """
        except Exception:
            # Si el token es invalido devuelve un error 401 token invalido/expirado/ausente
            return JsonResponse({}, status=401) 