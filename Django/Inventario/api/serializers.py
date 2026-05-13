from rest_framework import serializers
from .models import Lote, Movimiento

class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = '__all__' 
        read_only_fields = ['fecha_entrada']

class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimiento
        fields = '__all__'
        read_only_fields = ['fecha', 'usuario_id']