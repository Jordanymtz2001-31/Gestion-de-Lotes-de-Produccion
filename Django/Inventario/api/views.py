from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Lote, Movimiento
from .serializers import LoteSerializer, MovimientoSerializer
from rest_framework import viewsets
from api.services import verificar_producto, verificar_proveedor, actualizar_stock_producto, decrementar_stock_producto


#Para evitar repetir codigo creamos una funcion para crear movimientos
def crear_movimiento(lote, usuario_id, tipo, cantidad, destino, observaciones=None):
    return Movimiento.objects.create(
        lote=lote,
        usuario_id=usuario_id,
        tipo=tipo,
        cantidad=cantidad,
        destino=destino,
        observaciones=observaciones
    )


#Clase para la vista de lotes
class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer

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
            'Host' : 'localhost' #En desarollo usamos localhost, no pasamos por el api gateway, sino directamente al microservicio
        }

        # Verificamos que el producto existe
        producto = verificar_producto(producto_id, user_headers)
        if not producto['Valido']:
            return Response({'error':producto['error']}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que el proveedor existe
        proveedor = verificar_proveedor(proveedor_id, user_headers)
        if not proveedor['Valido']:
            return Response({'error':proveedor['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el lote - el stock No se toca aqui
        # El lote nace en REVISION por el default del modelo
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) #raise_exception=True es para que se muestre el error
        
        with transaction.atomic(): # Esto me ayuda que si falla el movimiento no se cree el lote
            lote = serializer.save()
            
            crear_movimiento(
                lote=lote,
                usuario_id=int(request.user_id),
                tipo='ENTRADA',
                cantidad=lote.cantidad_inicial,
                destino=None, # No aplica
                observaciones='Lote registrado en revisión'
            )
            
        return Response(LoteSerializer(lote).data, status=status.HTTP_201_CREATED)
    
    def partial_update(self, request, *args, **kwargs):
        # Solo supervisor y admin pueden cambiar el estado
        if request.user_rol not in ["SUPERVISOR", "ADMIN"]:
            return Response({'error': 'No tienes permiso para cambiar el estado del lote'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Obtenemos el nueevo estado del lote
        nuevo_estado = request.data.get('estado')
        lote = self.get_object() # Obtenemos el lote ACTUAL 

        # Validar que el estado nuevo sea válido
        estados_validos = ["REVISION", "APROBADO", "RECHAZADO", "AGOTADO"]
        if nuevo_estado not in estados_validos:
            return Response({'error': f'Estado inválido. Opciones: {estados_validos}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_headers = {
            'X-User-ID': request.user_id,
            'X-User-Rol': request.user_rol,
            'Host' : 'localhost'
        }

        # Obtenemos las observaciones al crear el movimiento en caso de que las haya
        observaciones = request.data.get('observaciones')

        with transaction.atomic():  # Esto me ayuda que si falla el movimiento no se cree el lote para ambos casos

            # Solo actualizamos stock si pasa de REVISION a APROBADO
            # Cualquier otro cambio de estado no toca el stock
            if nuevo_estado == "APROBADO" and lote.estado == "REVISION":

                producto = verificar_producto(lote.producto_id, user_headers)
                if not producto['Valido']:
                    raise Exception(producto['error'])

                # Actualizamos el stock
                actualizacion = actualizar_stock_producto(
                    lote.producto_id,
                    float(lote.cantidad_inicial),
                    float(producto['data']['stock_actual']),
                    user_headers
                )

                if not actualizacion['Valido']:
                    raise Exception(actualizacion['error'])

                # Si en observaciones viene algo, usamos eso, sino usamos el default
                obs = observaciones if observaciones else 'Lote aprobado por supervisor'
                crear_movimiento(
                    lote=lote,
                    usuario_id=int(request.user_id),
                    tipo='ENTRADA',
                    cantidad=lote.cantidad_inicial,
                    destino='INGRESO_ALMACEN',
                    observaciones=obs
                )

            if nuevo_estado == "RECHAZADO" and lote.estado == "APROBADO":

                producto = verificar_producto(lote.producto_id, user_headers)
                if not producto['Valido']:
                    raise Exception(producto['error'])

                actualizacion = actualizar_stock_producto(
                    lote.producto_id,
                    -float(lote.cantidad_actual),
                    float(producto['data']['stock_actual']),
                    user_headers
                )

                if not actualizacion['Valido']:
                    raise Exception(actualizacion['error'])

                # Si en observaciones viene algo, usamos eso, sino usamos el default
                obs = observaciones if observaciones else 'Lote rechazado por supervisor'
                crear_movimiento(
                    lote=lote,
                    usuario_id=int(request.user_id),
                    tipo='SALIDA',
                    cantidad=lote.cantidad_actual,
                    destino='DEVOLUCION_PROV',
                    observaciones=obs
                )

            # En el caso de que el SUPERVISOR cambie el estado de REVISION a RECHAZADO
            if nuevo_estado == "RECHAZADO" and lote.estado == "REVISION":
                # Si en observaciones viene algo, usamos eso, sino usamos el default
                obs = observaciones if observaciones else 'Lote rechazado por supervisor'
                crear_movimiento(
                    lote=lote,
                    usuario_id=int(request.user_id),
                    tipo='SALIDA',
                    cantidad=lote.cantidad_inicial,
                    destino='DEVOLUCION_PROV',
                    observaciones=obs
                )

        return super().partial_update(request, *args, **kwargs)


# ViewSet para movimientos (salidas de inventario)
class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer

    # Creamos una funcion para filtrar la lista de movimientos segun el rol
    # En ves de realizarlo en la base de datos, lo hacemos en el frontend
    def get_queryset(self):
        # Obtenemos los headers de la peticion
        rol = self.request.user_rol
        user_id = self.request.user_id

        if rol in ["ADMIN", "SUPERVISOR"]:
            return Movimiento.objects.all() # Admin y supervisor pueden ver todos

        return Movimiento.objects.filter(usuario_id=user_id) # Operador solo puede ver sus movimientos

    def create(self, request, *args, **kwargs):
        # Cualquier usuario autenticado puede crear una salida
        lote_id = request.data.get('lote')
        cantidad = Decimal(str(request.data.get('cantidad', 0)))

        # Headers para comunicación con otros servicios
        user_headers = {
            'X-User-ID': request.user_id,
            'X-User-Rol': request.user_rol,
            'Host': 'localhost'
        }

        # Validar que el lote existe
        try:
            lote = Lote.objects.get(id=lote_id)
        except Lote.DoesNotExist:
            return Response({'error': 'Lote no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Validar que el lote está APROBADO
        if lote.estado != 'APROBADO':
            return Response(
                {'error': f'No se puede realizar salida. El lote está en estado: {lote.estado}. Solo lotes APROBADOS pueden tener salidas.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar cantidad no exceda lo disponible
        if cantidad <= 0:
            return Response({'error': 'La cantidad debe ser mayor a 0'}, status=status.HTTP_400_BAD_REQUEST)

        if cantidad > float(lote.cantidad_actual):
            return Response(
                {'error': f'Cantidad excede lo disponible. Stock actual: {lote.cantidad_actual}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener el stock actual del producto
        producto = verificar_producto(lote.producto_id, user_headers)
        if not producto['Valido']:
            return Response({'error': producto['error']}, status=status.HTTP_400_BAD_REQUEST)

        # Decrementar stock del producto (pasar cantidad negativa)
        actualizacion = decrementar_stock_producto(
            lote.producto_id,
            float(cantidad),
            float(producto['data']['stock_actual']),
            user_headers
        )

        if not actualizacion['Valido']:
            return Response(
                {'error': f"No se pudo actualizar el stock: {actualizacion['error']}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #En caso de que el lote guarde pero movimiento falle, se debe hacer un rollback
        with transaction.atomic():
            # Decrementar cantidad_actual del lote
            lote.cantidad_actual -= Decimal(str(cantidad))
            if lote.cantidad_actual <= 0:
                lote.cantidad_actual = 0
                lote.estado = 'AGOTADO'
            lote.save()

            # Guardar movimiento
            movimiento = Movimiento.objects.create(
                lote=lote,
                usuario_id=int(request.user_id),
                tipo=request.data.get('tipo'),
                cantidad=cantidad,
                destino=request.data.get('destino'),
                observaciones=request.data.get('observaciones')
            )

        return Response(
            MovimientoSerializer(movimiento).data,status=status.HTTP_201_CREATED)