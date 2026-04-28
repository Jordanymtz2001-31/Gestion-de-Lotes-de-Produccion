from django.db.models import Sum
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Lote
from .serializers import LoteSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from api.services import verificar_producto, verificar_proveedor

#Clase para la vista de lotes
class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer

    permission_classes = [AllowAny]

    # Metodo para crear un lote para el operador y admin
    def create(self, request, *args, **kwargs):
        # Solo operador y admin pueden crear lotes
        if request.user_rol not in ["OPERADOR", "ADMIN"]:
            return Response({'error': 'No tienes permiso para crear lotes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtenemos los ids de producto y proveedor del cuerpo de la solicitud
        producto_id = request.data.get('producto_id')
        proveedor_id = request.data.get('proveedor_id')
        #cantidad_inicial = request.data.get('cantidad_inicial')

        # Headers que necesitan los otros servicios para pasar el middleware
        user_headers = {
            'X-User-ID': request.user_id,
            'X-User-Rol': request.user_rol,
            'Host' : 'localhost' #Tenemos que pasarle el host que crea la libreria requests automaticamente de lo contrario da error
        }

        # Verificamos que el producto existe
        producto = verificar_producto(producto_id, user_headers)
        if not producto['Valido']:
            return Response({'error':producto['error']}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que el proveedor existe
        proveedor = verificar_proveedor(proveedor_id, user_headers)
        if not proveedor['Valido']:
            return Response({'error':proveedor['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Si todo existe, crear el lote - el stock No se toca aqui
        # El lote nace en REVISION por el default del modelo
        return super().create(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Solo supervisor y admin pueden cambiar el estado
        if request.user_rol not in ["SUPERVISOR", "ADMIN"]:
            return Response({'error': 'No tienes permiso para cambiar el estado del lote'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Obtenemos el nueevo estado del lote
        nuevo_estado = request.data.get('estado')
        lote = self.get_object() # Obtenemos el lote ACTUAL 

        # Validar que el estado nuevo sea válido (EN POSTMAN mientras, ya en ANGULAR colocare los estados validos)
        estados_validos = ["REVISION", "APROBADO", "RECHAZADO", "AGOTADO"]
        if nuevo_estado and nuevo_estado not in estados_validos:
            return Response({'error': f'Estado inválido. Opciones: {estados_validos}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Solo actualizamos stock si pasa de REVISION a APROBADO
        # Cualquier otro cambio de estado no toca el stock
        if nuevo_estado == "APROBADO" and lote.estado == "REVISION":

            user_headers = {
                'X-User-ID': request.user_id,
                'X-User-Rol': request.user_rol
            }

            # Obtenemos el stock actual del producto y le pasamos el id del producto
            producto = verificar_producto(lote.producto_id, user_headers)
            if not producto['valido']:
                return Response({'error': producto['error']}, status=status.HTTP_400_BAD_REQUEST)

            # Sumamos la cantidad del lote al stock del producto
            actualizacion = actualizar_stock_producto(
                lote.producto_id, # Le pasamos el id del producto
                float(lote.cantidad_inicial), # Le pasamos la cantidad del lote
                float(producto['data']['stock_actual']), # Le pasamos el stock actual del producto
                user_headers # Le pasamos los headers
            )

            if not actualizacion['valido']:
                return Response(
                    {'error': f"No se pudo actualizar el stock: {actualizacion['error']}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Si el lote pasa a RECHAZADO y estaba APROBADO
        # hay que restar el stock que se había sumado
        if nuevo_estado == "RECHAZADO" and lote.estado == "APROBADO":

            user_headers = {
                'X-User-ID': request.user_id,
                'X-User-Rol': request.user_rol
            }

            # Obtenemos el producto
            producto = verificar_producto(lote.producto_id, user_headers)
            if not producto['valido']:
                return Response({'error': producto['error']}, status=status.HTTP_400_BAD_REQUEST)

            # Restamos — pasamos cantidad negativa
            actualizacion = actualizar_stock_producto(
                lote.producto_id,
                -float(lote.cantidad_actual),  # negativo para restar
                float(producto['data']['stock_actual']),
                user_headers
            )

            if not actualizacion['valido']:
                return Response(
                    {'error': f"No se pudo actualizar el stock: {actualizacion['error']}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().partial_update(request, *args, **kwargs)