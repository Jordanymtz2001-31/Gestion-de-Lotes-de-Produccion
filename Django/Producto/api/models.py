from django.db import models

# null=True le dice a mi base de datos que puede ser nulo
# blank=True determina si el campo es obligatorio, validacion a nivel de aplicacion


""" Managers personalizados para productos bajo umbral
class ProductosBajoUmbralManager(models.Manager):
    def get_queryset(self):
        productos = Producto.objects.with_low_stock() # llamamos al manager de productos bajo umbral
        return productos
"""
# Clase para el modelo de producto
class Producto(models.Model):
    nombre = models.CharField(max_length=50, null=False, blank=False)
    codigo = models.CharField(max_length=12, unique=True, null=False, blank=False)
    descripcion = models.TextField(null=True, blank=True)
    unidad_medida = models.CharField(max_length=20, null=False, blank=False)
    stock_actual = models.PositiveIntegerField(max_digits=10,
                                                decimal_places=2,
                                                default=0,
                                                null=False,
                                                blank=False) # PositiveIntegerField para garantizar que el stock sea un número positivo

    class Meta:
        db_table = 'producto'
