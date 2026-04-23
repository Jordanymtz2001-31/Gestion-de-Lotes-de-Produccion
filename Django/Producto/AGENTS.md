# AGENTS.md - Catalogo Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Microservicio

**Propósito:** Catálogo maestro de productos y proveedores

**Tablas:**
- PRODUCTO (id, nombre, codigo, unidad_medida, stock_actual)

**Relaciones:**
- PRODUCTO tiene muchos LOTE (related_name='lotes')


## Notas de Modelo

- `stock_actual` del producto se calcula dinámicamente: suma de `cantidad_actual` de todos los lotes en estado "Aprobado"
- El código del producto debe ser único
- El email del proveedor debe ser único

## Permisos por rol

| Rol | Permisos |
|-----|----------|
| admin | CRUD completo |
| operador | Lectura de catálogo |
| supervisor | Lectura y edición |

## Patrones a seguir

Seguir las prácticas del skill `django-expert`:
- Custom managers para consultas recurrentes (ej: productos con bajo stock)
- DRF con ModelSerializer
- CBV sobre FBV
- select_related/prefetch_related para optimizar queries

## Configuración para API Gateway

### Rutas requeridas en nginx.conf

Agregar la siguiente configuración en `Django/Api_Gateway/nginx.conf`:

```nginx
# Producto Service
location /producto/ {
    proxy_pass http://producto_app:8000/producto/;
    proxy_set_header Host localhost;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### URLs del proyecto

En `Django/Producto/Producto/urls.py`, incluir las rutas de la API:

```python
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('producto/', include('api.urls')),
]
```

### Configuración de Django

En `Django/Producto/Producto/settings.py`:

```python
ALLOWED_HOSTS = ['localhost', 'producto_app', 'gateway']
```

### Archivo de rutas API

Crear `Django/Producto/api/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet

router = DefaultRouter()
router.register(r'', ProductoViewSet, basename='producto')

urlpatterns = [
    path('producto/', include(router.urls)),
]
```

### Headers trustados

El servicio recibe los siguientes headers del API Gateway:
- `X-User-ID`: ID del usuario autenticado
- `X-User-Rol`: Rol del usuario (admin, operador, supervisor)

El middleware `GatewayAuthMiddleware` en `api/middleware.py` valida que estos headers estén presentes.

## Referencias

- Ver AGENTS.md raíz para flujo de negocio completo
- skill django-expert: `.agents/skills/django-expert/SKILL.md`
- API Gateway: `../Api_Gateway/AGENTS.md`