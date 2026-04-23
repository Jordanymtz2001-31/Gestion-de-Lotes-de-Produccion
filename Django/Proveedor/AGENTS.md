# Servicio Proveedor - Textiles la Poblana

> **Referencia general:** Consultar `./Django/AGENTS.md` para contexto completo del proyecto.

---

## 1. Información General

- **Propósito:** Catálogo de proveedores de materia prima textil
- **Puerto:** 8002
- **Contenedor:** proveedor_app
- **Ruta API:** `/proveedor/`
- **Estado:** ✅ Implementado

---

## 2. Estructura del Proyecto

```
Proveedor/
├── Proveedor/
│   ├── __init__.py
│   ├── settings.py      # Configuración Django del servicio
│   ├── urls.py          # URLs principales
│   ├── wsgi.py
│   └── asgi.py
├── api/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py        # Modelo Proveedor
│   ├── serializers.py   # DRF Serializer
│   ├── urls.py          # Router de la API
│   ├── views.py         # ViewSet
│   ├── middleware.py    # Middleware CORS
│   └── migrations/      # Migraciones Django
└── manage.py
```

---

## 3. Modelo de Datos

### Proveedor

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | AutoField | PK, auto-increment |
| nombre | CharField(50) | Requerido |
| telefono | CharField(15) | Requerido |
| email | EmailField | Único, requerido |

```python
# api/models.py
class Proveedor(models.Model):
    nombre = models.CharField(max_length=50, null=False, blank=False)
    telefono = models.CharField(max_length=15, null=False, blank=False) 
    email = models.EmailField(unique=True, null=False, blank=False)
    
    class Meta:
        db_table = 'proveedor'
```

---

## 4. API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/proveedor/proveedores/` | Listar todos los proveedores |
| POST | `/proveedor/proveedores/` | Crear nuevo proveedor |
| GET | `/proveedor/proveedores/{id}/` | Obtener proveedor por ID |
| PUT | `/proveedor/proveedores/{id}/` | Actualizar proveedor completo |
| PATCH | `/proveedor/proveedores/{id}/` | Actualizar proveedor parcial |
| DELETE | `/proveedor/proveedores/{id}/` | Eliminar proveedor |

### Respuestas típicas

```json
// GET /proveedor/proveedores/
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "nombre": "Textiles del Norte",
            "telefono": "5551234567",
            "email": "contacto@textilesnorte.com"
        }
    ]
}
```

---

## 5. Configuración

### Settings

El servicio usa configuración estándar Django:
- Puerto: 8002
- Base de datos: PostgreSQL (compartida)
- Serializers: DRF ModelSerializer
- Permisos: AllowAny (público)

### Middleware

```python
# api/middleware.py
class CustomCorsMiddleware:
    # Configuración CORS para permitir peticiones del frontend
```

---

## 6. Integración con API Gateway

El servicio Proveedor está configurado en el API Gateway:

```nginx
# nginx.conf (docker-compose)
location /proveedor/ {
    proxy_pass http://proveedor_app:8000/;
    # Headers trustados: X-User-ID, X-User-Rol
}
```

### Headers recibidos

| Header | Descripción |
|--------|-------------|
| `X-User-ID` | ID del usuario autenticado |
| `X-User-Rol` | Rol del usuario (admin, operador, supervisor) |

---

## 7. Comandos de Desarrollo

```bash
# Activar entorno virtual
cd Django/Proveedor
venv\Scripts\activate

# Migraciones
python manage.py makemigrations
python manage.py migrate

# Servidor desarrollo
python manage.py runserver 0.0.0.0:8002
```

---

## 8. Pendientes y Mejoras

- [ ] Implementar autenticación (AllowAny → IsAuthenticated)
- [ ] Agregar validaciones adicionales en serializer
- [ ] Agregar filtrado por nombre/email
- [ ] Implementar paginación personalizada
- [ ] Agregar logs de auditoría para creaciones/modificaciones