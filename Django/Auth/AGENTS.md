# AGENTS.md - Auth Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## 1. Contexto del Proyecto

- **Sistema:** Textiles la Poblana - Sistema de Gestión de Inventarios
- **Stack:** Angular 17 + NgRx / Django 5 + DRF + PostgreSQL / JWT
- **Propósito:** Autenticación y gestión de usuarios

## 2. Estructura del Proyecto

```
Auth/
├── api/
│   ├── __init__.py
│   ├── admin.py           # Configuración del admin de Django
│   ├── apps.py
│   ├── exceptions.py     # Manejador de excepciones personalizado
│   ├── migrations/
│   │   ├── 0001_initial.py
│   │   └── 0002_alter_usuario_email.py
│   ├── models.py         # Modelo Usuario (extends AbstractUser)
│   ├── permissions.py   # Permisos personalizados por rol
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py         # Rutas del API
│   └── views.py       # Vistas: LoginView, UsuarioViewSet, VerifyView
├── Usuario/
│   ├── settings.py    # Configuración Django
│   ├── urls.py       # URLs principales
│   ├── wsgi.py
│   └── manage.py
└── db.sqlite3       # Base de datos (desarrollo)
```

## 3. Modelo de Datos

### Usuario (api/models.py)

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    ROLES = (
        ('OPERADOR', 'Operador'),
        ('SUPERVISOR', 'Supervisor'),
        ('ADMIN', 'Administrador'),
    )
    
    rol = models.CharField(max_length=20, choices=ROLES, blank=False, null=False)
    email = models.EmailField(unique=True, error_messages={'unique': 'Ya existe un usuario con ese correo electrónico'})

    def __str__(self):
        return self.username
```

| Campo | Tipo | Restricciones |
|-------|------|--------------|
| id | PK | Auto increment |
| username | CharField | unique=True, required |
| email | EmailField | unique=True, required |
| password | CharField | Hasheado con make_password() |
| rol | CharField | OPERADOR/SUPERVISOR/ADMIN |
| is_active | Boolean | Default True |
| date_joined | DateTime | Auto |

**Hereda de AbstractUser:** first_name, last_name, is_staff, is_active, date_joined, last_login, etc.

### Roles disponibles

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso total (crear usuarios, CRUD completo) |
| OPERADOR | Registros de inventario |
| SUPERVISOR | Aprobación de lotes, reportes de calidad |

## 4. Configuración Principal

### settings.py (Usuario/settings.py)

```python
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-$r3l1j)d=^fyy-qs2-kw7v-xlb(!z0(8r5mtv0px#0!zqg5(hj'

DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'EXCEPTION_HANDLER': 'api.exceptions.custom_exception_handler',
}

AUTH_USER_MODEL = 'api.Usuario'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**Configuraciones importantes:**
- `AUTH_USER_MODEL = 'api.Usuario'` - Indica que usamos nuestro modelo personnalisé
- `JWTAuthentication` en DEFAULT_AUTHENTICATION_CLASSES - Necessario para reconocer tokens JWT
- CORS configurado para localhost:4200 (Angular)

## 5. Endpoints del API

### Rutas configuradas (api/urls.py + Usuario/urls.py)

```python
# Usuario/urls.py
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('usuario/', include('api.urls')),
]

# api/urls.py
from rest_framework.routers import DefaultRouter
from api import views

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('verify/', views.VerifyView.as_view(), name='verify'),
    path('', include(router.urls)),
]
```

### URLs finales

| Método | URL | Descripción | Auth |
|--------|-----|------------|------|
| POST | `/usuario/login/` | Iniciar sesión, retorna JWT | Público |
| GET/POST | `/usuario/verify/` | Verificar token, retorna headers | Público |
| GET | `/usuario/usuarios/` | Listar todos los usuarios | JWT + ADMIN |
| POST | `/usuario/usuarios/` | Crear usuario | JWT + ADMIN |
| GET | `/usuario/usuarios/{id}/` | Ver usuario específico | JWT + ADMIN |
| PUT/PATCH | `/usuario/usuarios/{id}/` | Actualizar usuario | JWT + ADMIN |
| DELETE | `/usuario/usuarios/{id}/` | Eliminar usuario | JWT + ADMIN |

## 6. Serializers

### RegistrarUsuarioSerializer (api/serializers.py:5)

Para crear nuevos usuarios. Hashea la contraseña antes de guardar.

```python
class RegistrarUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
```

### UsuarioSerializer (api/serializers.py:18)

Para leer/actualizar usuarios. No incluye password.

```python
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']
```

### LoginSerializer (api/serializers.py:25)

Validación de credenciales para login.

```python
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
```

## 7. Views

### LoginView (api/views.py:38)

- **Permission**: AllowAny (público)
- **POST**: Valida credenciales, retorna access token JWT + datos del usuario

```python
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)
            if user is None:
                return Response(
                    {'error': 'Credenciales inválidas'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'rol': user.rol
                }
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

**Request:**
```json
{
    "username": "admin",
    "password": "password123"
}
```

**Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@textiles.com",
        "rol": "ADMIN"
    }
}
```

### UsuarioViewSet (api/views.py:15)

- **Permission**: IsAuthenticated + Is_Admin
- **CRUD completo** de usuarios
- Solo usuarios con rol ADMIN pueden crear nuevos usuarios

```python
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, Is_Admin]

    def get_serializer_class(self):
        if self.action == 'create':
            return RegistrarUsuarioSerializer
        return UsuarioSerializer

    def create(self, request, *args, **kwargs):
        user_rol = (getattr(request.user, 'rol', '') or '').upper()
        if user_rol != 'ADMIN':
            return Response(
                {'error': 'Solo administradores pueden crear usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
```

### VerifyView (api/views.py:72)

- **Permission**: AllowAny (público)
- Decodifica el token JWT y expone headers para nginx (X-User-ID, X-User-Rol)
- Útil para autenticación a nivel de nginx con auth_request

```python
class VerifyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return self._verify(request)

    def post(self, request):
        return self._verify(request)

    def _verify(self, request):
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()

        if not token:
            return JsonResponse({}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            tb = TokenBackend(
                algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
                signing_key=settings.SIMPLE_JWT.get('SIGNING_KEY', settings.SECRET_KEY)
            )
            payload = tb.decode(token, verify=True)

            response = JsonResponse({}, status=status.HTTP_200_OK)
            response['X-User-ID'] = str(payload.get('user_id', ''))
            response['X-User-Rol'] = payload.get('rol', '')

            return response
        except Exception:
            return JsonResponse({}, status=401)
```

## 8. Permissions

### Estructura (api/permissions.py)

```python
from rest_framework.permissions import BasePermission

class Is_Operador(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
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
```

**Importante**: El método `has_permission` recibe 3 parámetros: `self, request, view`. El parámetro `view` es obligatorio en la firma del método.

## 9. Custom Exception Handler

### api/exceptions.py

Manejador de excepciones personalizado para mensajes de error consistentes.

```python
from rest_framework.views import exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, AuthenticationFailed, ValidationError
from django.http import Http404
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, NotAuthenticated):
            response.data = {'error': 'No esta autenticado, Autenticacion Fallida'}
            response.status_code = status.HTTP_401_UNAUTHORIZED
        elif isinstance(exc, AuthenticationFailed):
            response.data = {'error': 'Credenciales invalidas, Autenticacion Fallida'}
            response.status_code = status.HTTP_401_UNAUTHORIZED
        elif isinstance(exc, PermissionDenied):
            response.data = {'error': 'Estas autenticado, pero no tienes permiso para realizar esta accion, Permiso Denegado'}
            response.status_code = status.HTTP_403_FORBIDDEN
        elif isinstance(exc, ValidationError):
            response.data = {'error': 'Datos no validos, falta de datos o caracteres invalidos'}
            response.status_code = status.HTTP_400_BAD_REQUEST
        elif isinstance(exc, Http404):
            response.data['detail'] = 'No se encontro el recurso solicitado'

    return response
```

## 10. Admin Django

### api/admin.py

```python
from django.contrib import admin
from api.models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'rol')
```

## 11. Crear Primer Administrador

### Problema: "El huevo y la gallina"

Si no hay usuarios en la DB y el endpoint de creación requiere ADMIN, ¿cómo crear el primer administrador?

### Solución: Comando CLI

```bash
cd Django/Auth
python manage.py shell
```

```python
from api.models import Usuario
from django.contrib.auth.hashers import make_password

# Crear admin
Usuario.objects.create_user(
    username='admin',
    email='admin@textiles.com',
    password='password123',
    rol='ADMIN'
)
```

O desde el admin de Django después de crear superuser:
1. `python manage.py createsuperuser` → crear superuser
2. Ejecutar shell y asignar rol:
```python
u = Usuario.objects.get(username='admin')
u.rol = 'ADMIN'
u.save()
```

## 12. Cómo Usar el Servicio

### 1. Login (obtener token)

```bash
curl -X POST http://localhost:8000/usuario/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### 2. Listar usuarios (con token)

```bash
curl -X GET http://localhost:8000/usuario/usuarios/ \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 3. Crear usuario (solo ADMIN)

```bash
curl -X POST http://localhost:8000/usuario/usuarios/ \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "nuevo_op", "email": "op@textiles.com", "password": "pass123", "rol": "OPERADOR"}'
```

## 13. Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|---------|
| `401 Unauthorized` | Token no reconocido | Agregar JWTAuthentication en settings.py |
| `403 Permission Denied` | Usuario no tiene rol ADMIN | Asignar rol='ADMIN' al usuario en DB |
| `UNIQUE constraint failed: email` | Email duplicado | Limpiar duplicados o usar email diferente |
| `takes 2 positional arguments but 3 were given` | Falta parámetro `view` en permission | Agregar `view` como tercer parámetro |
| `Credenciales inválidas` | Username/password incorrectos | Verificar credenciales |

### Solución: Email duplicado

```python
# Verificar duplicados
from api.models import Usuario
from django.db.models import Count

Usuario.objects.values('email').annotate(cnt=Count('email')).filter(cnt__gt=1)

# Eliminar duplicados
usuarios = Usuario.objects.filter(email='dup@email.com').order_by('id')
principal = usuarios.first()
usuarios.exclude(id=principal.id).delete()
```

## 14. Migraciones

Cuando se hace cambios en el modelo:

```bash
cd Django/Auth
python manage.py makemigrations
python manage.py migrate
```

**Nota para email unique**: Si ya hay datos duplicados, la migración fallará. Limpiar duplicados primero.

### Historial de migraciones

| Migration | Descripción |
|----------|-------------|
| 0001_initial.py | Creación del modelo Usuario |
| 0002_alter_usuario_email.py | Agregar unique=True al campo email |

## 15. Patrones Recomendados

- Usar AbstractUser de Django como base
- Campo email con unique=True en modelo (requiere migrate)
- Passwords hasheados con make_password()
- JWT con access token largo (7 días), sin refresh
- Permissions personalizadas por rol (con parámetro `view`)
- JWTAuthentication en DEFAULT_AUTHENTICATION_CLASSES
- Custom exception handler para mensajes consistentes

## 16. Pendientes

- [ ] Redis para blacklist de tokens (versión futura)
- [ ] Implementar logout (invalidar token)
- [ ] Refresh token si se necessita sesión más corta
- [ ] Tests unitarios
- [ ] Logging detallado