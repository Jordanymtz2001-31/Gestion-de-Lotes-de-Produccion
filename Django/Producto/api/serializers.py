from rest_framework import serializers
from api.models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['stock_actual'] # Solo de lectura - protegerlo para que no se pueda modificar o agregar
        
        