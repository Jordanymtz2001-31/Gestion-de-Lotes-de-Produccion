from rest_framework import viewsets
from .serializers import ProveedorSerializer
from api.models import Proveedor
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response

# Clase para la vista de proveedor
class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

    permission_classes = [AllowAny]

    #Metodo para crear un proveedor pero solo admin
    def create(self, request, *args, **kwargs):
        if request.user_rol != "ADMIN":
            return Response({"error": "No tienes permiso para crear proveedores"}, 
                            status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)
    
    #Metodo para actualizar un proveedor pero solo admin
    def partial_update(self, request, *args, **kwargs):
        if request.user_rol != "ADMIN":
            return Response({"error": "No tienes permiso para actualizar proveedores"}, 
                            status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)
    
    #Metodo para eliminar un proveedor pero solo admin
    def destroy(self, request, *args, **kwargs):
        if request.user_rol != "ADMIN":
            return Response({"error": "No tienes permiso para eliminar proveedores"}, 
                            status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)