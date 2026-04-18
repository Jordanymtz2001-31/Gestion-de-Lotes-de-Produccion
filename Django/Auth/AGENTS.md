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
│   ├── admin.py          # Configuración del admin de Django
│   ├── apps.py
│   ├── exceptions.py   # Manejador de excepciones personalizado
│   ├── migrations/
│   ├── models.py      # Modelo Usuario (extends AbstractUser)
│   ├── permissions.py # Permisos personalizados por rol
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py      # Rutas del API
│   └── views.py    # Vistas: LoginView, UsuarioViewSet, VerifyView
├── Usuario/
│   ├── settings.py  # Configuración Django
│   ├── urls.py    # URLs principales
│   ├── wsgi.py
│   └── manage.py
└── db.sqlite3   # Base de datos (desarrollo)
```

## 3. Modelo de Datos

### Usuario (api/models.py)

```python
class Usuario(AbstractUser):
    ROLES = (
        ('OPERADOR', 'Operador'),
        ('SUPERVISOR', 'Supervisor'),
        ('ADMIN', 'Administrador'),
    )
    
    rol = models.CharField(max_length=20, choices=ROLES, blank=False, null=False)
    email = models.EmailField(unique=True)
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

### Roles disponibles

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso total (crear usuarios, CRUD completo) |
| OPERADOR | Registros de inventario |
| SUPERVISOR | Aprobación de lotes, reportes de calidad |

## 4. Endpoints del API

### Rutas configuradas (api/urls.py + Usuario/urls.py)

```
/usuario/login/      → POST LoginView
/usuario/verify/     → GET/POST VerifyView (para nginx)
/usuario/usuarios/   → UsuarioViewSet (CRUD)
```

| Método | URL | Descripción | Auth |
|--------|-----|------------|------|
| POST | `/usuario/login/` | Iniciar sesión, retorna JWT | Público |
| GET/POST | `/usuario/verify/` | Verificar token, retorna headers | Público |
| GET | `/usuario/usuarios/` | Listar todos los usuarios | JWT + ADMIN |
| POST | `/usuario/usuarios/` | Crear usuario | JWT + ADMIN |
| GET | `/usuario/usuarios/{id}/` | Ver usuario específico | JWT + ADMIN |
| PUT/PATCH | `/usuario/usuarios/{id}/` | Actualizar usuario | JWT + ADMIN |
| DELETE | `/usuario/usuarios/{id}/` | Eliminar usuario | JWT + ADMIN |

## 5. Serializers

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

## 6. Views

### LoginView (api/views.py:38)

- **Permission**: AllowAny (público)
- **POST**: Valida credenciales, retorna access token JWT + datos del usuario

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

### VerifyView (api/views.py:72)

- **Permission**: AllowAny (público)
- Decodifica el token JWT y expone headers para nginx (X-User-ID, X-User-Rol)
- Útil para autenticación a nivel de nginx con auth_request

## 7. Permissions

### Is_Admin (api/permissions.py:28)

```python
class Is_Admin(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return (getattr(user, 'rol', '') or '').upper() == 'ADMIN'
```

**Nota**: El método `has_permission` recibe 3 parámetros: `self, request, view`. El parámetro `view` es opcional pero debe declararse.

Analogous classes: Is_Operador, Is_Supervisor

## 8. Configuración JWT

### settings.py

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),  # Token válido por 7 días
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
```

**Importante**: JWTAuthentication debe estar en DEFAULT_AUTHENTICATION_CLASSES para que DRF reconozca los tokens JWT.

## 9. Crear Primer Administrador

### Problema: "El huevo y la gallina"

Si no hay usuarios en la DB y el endpoint de creación requiere ADMIN, ¿cómo crear el primer administrador?

### Solución: Comando CLI

```bash
# Dentro de Django/Auth/
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
2. Ejecutar shell y asignar rol: `u = Usuario.objects.get(username='admin'); u.rol = 'ADMIN'; u.save()`

## 10. Cómo Usar el Servicio

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

## 11. Errores Comunes y Soluciones

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
 Usuario.objects.values('email').annotate(cnt=models.Count('email')).filter(cnt__gt=1)

# Eliminar duplicados
usuarios = Usuario.objects.filter(email='dup@email.com').order_by('id')
principal = usuarios.first()
usuarios.exclude(id=principal.id).delete()
```

## 12. Migraciones

Cuando se hace cambios en el modelo:

```bash
cd Django/Auth
python manage.py makemigrations
python manage.py migrate
```

**Nota para email unique**: Si ya hay datos duplicados, la migración fallará. Limpiar duplicados primero.

## 13. Patrones Recomendados

- Usar AbstractUser de Django como base
- Campo email con unique=True en modelo (requiere migrate)
- Passwords hasheados con make_password()
- JWT con access token largo (7 días), sin refresh
- Permissions personalizadas por rol
- JWTAuthentication en DEFAULT_AUTHENTICATION_CLASSES

## 14. Pendientes

- [ ] Redis para blacklist de tokens (versión futura)
- [ ] Implementar logout (invalidar token)
- [ ] Refresh token si se necessita sesión más corta
- [ ] Tests unitarios