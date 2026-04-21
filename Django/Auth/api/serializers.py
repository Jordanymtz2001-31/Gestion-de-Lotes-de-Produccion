from rest_framework import serializers
from api.models import Usuario
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'password', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined'] # read_only_fields es para indicar que campos no se pueden editar
        # Indicamos que la contraseña no se muestre
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        #Encriptamos la contraseña
        #Usamos la funcion de make_password para encriptar(hashear) antes de guardar
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

