from rest_framework.permissions import BasePermission
#Con BasePermission podemos crear permisos personalizados
#Para crear un permiso personalizado debemos crear una clase abstracta que herede de BasePermission

class Is_Operador(BasePermission):
    def has_permission(self, request, view):
        #Obtenemos el usuario
        #El getattr es para obtener un atributo de un objeto es decir user
        #El None en si el request no tiene un atributo user, devuelve None en ves de un error
        #getattr(obj, atributo, valor_por_defecto)
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        #Aqui '' son valores por defecto en caso de que no exista el rol
        #En caso de que no exista el rol se devuelve un string vacio
        #En caso de que exista el rol se devuelve el rol en mayusculas
        return (getattr(user, 'rol', '') or '').upper() == 'OPERADOR'


class Is_Supervisor(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return (getattr(user, 'rol', '') or '').upper() == 'SUPERVISOR'


class Is_Admin(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return (getattr(user, 'rol', '') or '').upper() == 'ADMIN'