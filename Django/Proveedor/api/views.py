from rest_framework import viewsets
from .serializers import ProveedorSerializer
from api.models import Proveedor
from rest_framework.permissions import AllowAny

# Clase para la vista de proveedor
class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

    permission_classes = [AllowAny]