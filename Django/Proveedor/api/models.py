from django.db import models
# null=True le dice a mi base de datos que puede ser nulo
# blank=True determina si el campo es obligatorio, validacion a nivel de aplicacion

# Create your models here.
class Proveedor(models.Model):
    nombre = models.CharField(max_length=50, null=False, blank=False)
    telefono = models.CharField(unique=True, max_length=15, null=False, blank=False, error_messages={'unique': 'Ya existe un proveedor con ese telefono'}) 
    email = models.EmailField(unique=True, null=False, blank=False, error_messages={'unique': 'Ya existe un proveedor con ese correo'})
    # No se muestra los mensajes de error a menos que se especifique en el custom_exeptions_headers
    class Meta:
        db_table = 'proveedor'