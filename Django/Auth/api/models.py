from django.db import models
from django.contrib.auth.models import AbstractUser

# Creamos nuestro modelo de usuario 
#Ocuparemos la clase abstracta User de django
class Usuario(AbstractUser):
    ROLES = (
        ('OPERADOR', 'Operador'),
        ('SUPERVISOR', 'Supervisor'),
        ('ADMIN', 'Administrador'),
    )
    #Agregamos el campo rol
    rol = models.CharField(max_length=20, choices=ROLES, blank=False, null=False) #El blank y null son para que no se puedan dejar campos vacios
    email = models.EmailField(unique=True, error_messages={'unique': 'Ya existe un usuario con ese correo electrónico'})

    def __str__(self):
        return self.username