from rest_framework import viewsets
from .serializers import ProductoSerializer, StockUpdateSerializer
from api.models import Producto
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action

# Clase para la vista de productos
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

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

    # Metodo especial para actualizar el stock
    @action(detail=True, methods=['patch'], url_path='actualizar-stock')
    def actualizar_stock(self, request, pk=None):
        producto = self.get_object() # Obtenemos el producto
        #Utilizamos el serializador que solo actualiza el stock
        serializer = StockUpdateSerializer(producto, data=request.data, partial=True) # Pasamos el producto y los datos al serializador y indicamos que es parcial
        if serializer.is_valid(): # Si los datos son validos
            serializer.save() # Guardamos los cambios
            return Response(ProductoSerializer(producto).data) # Devolvemos el producto
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)