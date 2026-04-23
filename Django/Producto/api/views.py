from rest_framework import viewsets
from .serializers import ProductoSerializer
from api.models import Producto
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response

# Clase para la vista de productos
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    permission_classes = [AllowAny]

    #Metodo para crear productos pero solo para Administradores
    def create(self, request, *args, **kwargs):
        if request.user_rol != "ADMIN":
            return Response({"error": "No tienes permiso para crear productos"}, 
                            status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)
    
    #Metodo para actualizar productos pero solo para Administradores
    def parcial_update(self, request, *args, **kwargs):
        if request.user_rol != "ADMIN":
            return Response({"error": "No tienes permiso para actualizar productos"}, 
                            status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)
    
    #Metodo para eliminar productos pero solo para Administradores
    def destroy(self, request, *args, **kwargs):
        if request.user_rol != "ADMIN":
            return Response({"error": "No tienes permiso para eliminar productos"}, 
                            status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)