from rest_framework import viewsets
from .serializers import ProductoSerializer
from api.models import Producto
from rest_framework.permissions import AllowAny

# Clase para la vista de productos
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    permission_classes = [AllowAny]