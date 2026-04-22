from django.db import models

# null=True le dice a mi base de datos que puede ser nulo
# blank=True determina si el campo es obligatorio, validacion a nivel de aplicacion

# Creamos el modelo de Lote
class Lote(models.Model):
    codigo_lote = models.CharField(max_length=25,null=False, blank=False, unique=True)
    producto_id = models.PositiveIntegerField(null=False, blank=False)
    proveedor_id = models.PositiveIntegerField(null=False, blank=False)
    cantidad_inicial = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False) # La cantidad que llega en el lote
    cantidad_actual = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False) # Para ir disminullendo en cada salida de cada lote
    fecha_produccion = models.DateField(null=False, blank=False)
    fecha_entrada = models.DateTimeField(auto_now_add=True)
    ESTADO = [
        ("REVICION", "Revisión"),
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