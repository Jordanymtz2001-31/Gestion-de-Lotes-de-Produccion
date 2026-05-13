from rest_framework import serializers
from api.models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['stock_actual'] # Solo de lectura - protegerlo para que no se pueda modificar o agregar
        
#Creamos un serializer especial solo para actualizar el stock que viene desde inventario
class StockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['stock_actual'] # Solo esta propiedad