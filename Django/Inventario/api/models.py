from django.db import models

# null=True le dice a mi base de datos que puede ser nulo
# blank=True determina si el campo es obligatorio, validacion a nivel de aplicacion

# Creamos el modelo de Lote
class Lote(models.Model):
    codigo_lote = models.CharField(max_length=25,null=False, blank=False, unique=True)
    producto_id = models.PositiveIntegerField(null=False, blank=False)
    proveedor_id = models.PositiveIntegerField(null=False, blank=False)
    cantidad_inicial = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False) # La cantidad que llega en el lote
    cantidad_actual = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Para ir disminullendo en cada salida de cada lote
    fecha_produccion = models.DateField(null=False, blank=False)
    fecha_entrada = models.DateTimeField(auto_now_add=True)
    ESTADO = [
        ("REVISION", "Revisión"),
        ("APROBADO", "Aprobado"),
        ("RECHAZADO", "Rechazado"),
        ("AGOTADO", "Agotado"),
    ]
    estado = models.CharField(max_length=20, choices=ESTADO, default="REVICION", null=False, blank=False)

    #Metodo para guardar la cantidad_actual que sera la misma la primera ves que se registre el lote
    #Posteriormente ese se ira disminuyendo en cada salida
    def save(self, *args, **kwargs):
        if self.pk is None:
            self.cantidad_actual = self.cantidad_inicial
        super(Lote, self).save(*args, **kwargs)
        
    def __str__(self):
        return self.codigo_lote

    class Meta:
        db_table = "Lote"
        ordering = ["-fecha_entrada"]


# Modelo para movimientos de inventario (salidas)
class Movimiento(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name='movimientos')
    usuario_id = models.PositiveIntegerField(null=False, blank=False)
    TIPOS = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA',  'Salida'),
    ]

    tipo = models.CharField(max_length=20, null=False, blank=False, choices=TIPOS)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    DESTINOS = [
        # Salidas
        ('PRODUCCION',      'Producción'),
        ('VENTA',           'Venta'),
        ('DEVOLUCION_PROV', 'Devolución a proveedor'),
        ('MUESTRA',         'Muestra'),
        # Entradas
        ('COMPRA',          'Compra'),
        ('INGRESO_ALMACEN', 'Ingreso al almacen'),
    ]
    destino = models.CharField(max_length=100, null=True, blank=True, choices=DESTINOS) # Lo dejamos nulo por que al crear un lote no se le asigna ningun destino
    observaciones = models.TextField(null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Movimiento"
        ordering = ["-fecha"]