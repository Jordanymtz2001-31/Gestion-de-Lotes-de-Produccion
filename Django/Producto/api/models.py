from django.db import models

# null=True le dice a mi base de datos que puede ser nulo
# blank=True determina si el campo es obligatorio, validacion a nivel de aplicacion

# Clase para el modelo de producto
class Producto(models.Model):
    nombre = models.CharField(max_length=50, null=False, blank=False)
    codigo = models.CharField(max_length=12, unique=True, null=False, blank=False)
    descripcion = models.TextField(null=True, blank=True)
    unidad_medida = models.CharField(max_length=20, null=False, blank=False)
    stock_actual = models.PositiveIntegerField(null=False, blank=False) # PositiveIntegerField para garantizar que el stock sea un número positivo

    class Meta:
        db_table = 'Producto'
