from rest_framework_simplejwt.tokens import AccessToken

# Clase para generar token personalizado y agregar el rol
# Por que aun no estamos usando el token por defecto junto con el RefreshToken
class CustomAccessToken(AccessToken):
    @classmethod # Decorador para sobreescribir el metodo
    def for_user(cls, user):
        token = super().for_user(user) # Obtenemos el token
        token['rol'] = user.rol  # agrega el rol al payload del JWT
        return token