from rest_framework.permissions import BasePermission
#Con BasePermission podemos crear permisos personalizados
#Para crear un permiso personalizado debemos crear una clase abstracta que herede de BasePermission

class Is_Operador(BasePermission):
    def has_permission(self, request, view):
        return (request.headers.get('X-User-Rol', '') or '').upper() == 'OPERADOR'


class Is_Supervisor(BasePermission):
    def has_permission(self, request, view):
        return (request.headers.get('X-User-Rol', '') or '').upper() == 'SUPERVISOR'


class Is_Admin(BasePermission):
    def has_permission(self, request, view):
        return (request.headers.get('X-User-Rol', '') or '').upper() == 'ADMIN'