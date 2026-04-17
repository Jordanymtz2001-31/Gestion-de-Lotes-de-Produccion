from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from api.serializers import RegistrarUsuarioSerializer, UsuarioSerializer, LoginSerializer
from api.permissions import Is_Admin
from api.models import Usuario

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    #Definimos permisos
    permission_classes = [IsAuthenticated, Is_Admin]

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
        return super().create(request, *args, **kwargs)
    

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
                return Response(
                    {'error': 'Credenciales inválidas'},status=status.HTTP_401_UNAUTHORIZED
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

