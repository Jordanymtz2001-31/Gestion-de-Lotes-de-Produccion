# Sistema de Gestión de Inventarios Textiles - Textiles la Poblana

> **Nota:** Esta guía sigue las mejores prácticas del skill `django-expert`. Consultar `.agents/skills/django-expert/SKILL.md` para detalles técnicos adicionales.

---

## 1. Información General

- **Nombre:** Textiles la Poblana - Sistema de Gestión de Inventarios
- **Stack:** Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT
- **Puerto Gateway:** 8080 (nginx)
- **Descripción:** Sistema de gestión de inventarios textiles con control de lotes, movimientos, calidad y alertas de stock

---

## 2. Arquitectura de Microservicios

| Servicio | Puerto | Contenedor | Tablas | Estado |
|----------|--------|------------|--------|--------|
| **API Gateway** | 8080 | gateway | - | ✅ Implementado |
| **Auth** | 8000 | usuarios_app | USUARIO | ✅ Implementado |
| **Producto** | 8001 | producto_app | PRODUCTO | ✅ Implementado |
| **Proveedor** | 8002 | proveedor_app | PROVEEDOR | ✅ Implementado |
| **Inventario** | 8003 | inventario_app | LOTE, MOVIMIENTO | ✅ Implementado |
| **Calidad** | 8004 | calidad_app | REPORTE_CALIDAD | 🔄 Pendiente |
| **Alertas** | 8005 | alertas_app | ALERTA_STOCK | 🔄 Pendiente |

> **Nota:** Para detalles específicos de cada servicio, consultar su AGENTS.md en la carpeta correspondiente.

---

## 3. API Gateway (nginx)

### Flujo de validación JWT

```
Cliente → nginx:8080 → auth_request /auth-verify → Auth Service
                                         ↓
                              Si token válido
                                         ↓
                              nginx inyecta headers
                                         ↓
                              Servicio destino
```

### Rutas configuradas en nginx

| Ruta | Servicio | Puerto |
|------|----------|--------|
| `/usuario/login/` | Auth | 8000 |
| `/usuario/usuarios/` | Auth | 8000 |
| `/producto/productos/` | Producto | 8001 |
| `/proveedor/proveedores/` | Proveedor | 8002 |
| `/inventario/lotes/` | Inventario | 8003 |

### Headers trustados

| Header | Descripción |
|--------|-------------|
| `X-User-ID` | ID del usuario autenticado |
| `X-User-Rol` | Rol (ADMIN, OPERADOR, SUPERVISOR) |

### Rutas públicas (sin JWT)

- `/usuario/login/`

---

## 4. Modelo de Datos

### USUARIO
> Ver: `./Auth/AGENTS.md`

### PRODUCTO
> Ver: `./Producto/AGENTS.md`

### PROVEEDOR
> Ver: `./Proveedor/AGENTS.md`

### LOTE
> Ver: `./Inventario/AGENTS.md`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | PK |
| codigo_lote | CharField(25) | Unique |
| producto_id | PositiveIntegerField | FK a Producto |
| proveedor_id | PositiveIntegerField | FK a Proveedor |
| cantidad_inicial | DecimalField | Cantidad recibida |
| cantidad_actual | DecimalField | Stock actual (se reduce con salidas) |
| fecha_produccion | DateField | Fecha de producción |
| fecha_entrada | DateTimeField | Fecha de registro (auto) |
| estado | CharField | REVISION/APROBADO/RECHAZADO/AGOTADO |

### MOVIMIENTO
> Ver: `./Inventario/AGENTS.md`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | PK |
| lote_id | ForeignKey | FK a LOTE |
| usuario_id | PositiveIntegerField | Usuario que registra |
| tipo | CharField | entrada/salida/ajuste |
| cantidad | DecimalField | Cantidad del movimiento |
| destino | CharField | Nullable (solo salidas) |
| fecha | DateTimeField | auto_now_add=True |
| observaciones | TextField | Notas opcionales |

### Estados de Lote

| Estado | Descripción |
|--------|-------------|
| REVISION | Recién registrado, no disponible para salidas |
| APROBADO | Aprobado por supervisor, disponible para salidas |
| RECHAZADO | No cumple estándares de calidad |
| AGOTADO | Sin stock disponible (cantidad_actual = 0) |

---

## 5. Sistema de Autenticación JWT

### Configuración actual

- **Access token:** 1 día de validez
- **Validación:** Solo firma criptográfica (sin estado en servidor)
- **Ruta verify:** `/usuario/verify/` (usada por nginx auth_request)

### Flujo de autenticación

```
1. Login (público):
   POST /usuario/login/ {username, password}
   → Auth retorna {"access": "token", "user": {...}}

2. Peticiones protegidas:
   Header: Authorization: Bearer <token>
   → nginx valida en /auth-verify
   → Si válido, inyecta X-User-ID, X-User-Rol

3. Logout:
   Cliente limpia el token (sin revocación en esta versión)
```

### Roles

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso total a todos los endpoints |
| OPERADOR | Crear lotes, registrar movimientos |
| SUPERVISOR | Aprobar/rechazar lotes |

---

## 6. Patrones Django/DRF

> **Importante:** Consultar skill `django-expert` en `.agents/skills/django-expert/SKILL.md`

### Modelos y Custom Managers

```python
# Inventario/api/models.py
class LoteManager(models.Manager):
    def approved(self):
        return self.filter(estado='APROBADO')
    
    def available(self):
        return self.filter(estado='APROBADO', cantidad_actual__gt=0)
    
    def pending_review(self):
        return self.filter(estado='REVISION')

class Lote(models.Model):
    # ...
    objects = LoteManager()
```

### Optimización de consultas

```python
# Evitar N+1
Lote.objects.select_related('producto', 'proveedor').all()
```

### Seguridad

- Siempre usar ORM, nunca SQL plano
- Passwords con `make_password()`
- Headers trustados: `request.META.get('HTTP_X_USER_ROL')`

---

## 7. Comunicación entre Microservicios

### Inventario ↔ Producto

```python
PRODUCTO_URL = "http://producto_app:8001"
# Al aprobar lote: PATCH /productos/{id}/ actualizar stock
```

### Inventario ↔ Proveedor

```python
PROVEEDOR_URL = "http://proveedor_app:8002"
# Validar que existe el proveedor al crear lote
```

### Headers en comunicación servicio a servicio

```python
headers = {
    'X-User-ID': request.META.get('HTTP_X_USER_ID'),
    'X-User-Rol': request.META.get('HTTP_X_USER_ROL')
}
```

---

## 8. Pruebas de Endpoints via API Gateway

> Puerto del Gateway: **8080**

### Autenticación

```bash
# Login
curl -X POST http://localhost:8080/usuario/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

---

### Endpoints Protegidos

Todos requieren: `Authorization: Bearer {access_token}`

#### Usuario (Auth)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/usuario/usuarios/` | ADMIN | Listar |
| POST | `/usuario/usuarios/` | ADMIN | Crear |
| GET | `/usuario/usuarios/{id}/` | ADMIN | Ver |
| PUT/PATCH | `/usuario/usuarios/{id}/` | ADMIN | Actualizar |
| DELETE | `/usuario/usuarios/{id}/` | ADMIN | Eliminar |

#### Producto

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/producto/productos/` | - | Listar |
| POST | `/producto/productos/` | ADMIN | Crear |
| GET | `/producto/productos/{id}/` | - | Ver |
| PUT/PATCH | `/producto/productos/{id}/` | ADMIN | Actualizar |
| DELETE | `/producto/productos/{id}/` | ADMIN | Eliminar |

#### Proveedor

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/proveedor/proveedores/` | - | Listar |
| POST | `/proveedor/proveedores/` | ADMIN | Crear |
| GET | `/proveedor/proveedores/{id}/` | - | Ver |
| PUT/PATCH | `/proveedor/proveedores/{id}/` | ADMIN | Actualizar |
| DELETE | `/proveedor/proveedores/{id}/` | ADMIN | Eliminar |

#### Inventario

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/inventario/lotes/` | - | Listar lotes |
| POST | `/inventario/lotes/` | OPERADOR, ADMIN | Crear lote |
| GET | `/inventario/lotes/{id}/` | - | Ver lote |
| PATCH | `/inventario/lotes/{id}/` | ADMIN, SUPERVISOR | Actualizar estado |
| GET | `/inventario/stock/?producto_id=X` | - | Consultar stock |

---

## 9. Pendientes Técnicos

- [x] API Gateway con nginx (auth_request)
- [x] Auth Service
- [x] Producto Service
- [x] Proveedor Service
- [x] Inventario Service (lotes y movimientos)
- [ ] Calidad Service
- [ ] Alertas Service
- [ ] Redis para blacklist de tokens
- [ ] Celery para eventos asíncronos

---

## 10. Estructura de Archivos

```
Django/
├── AGENTS.md                    # Este archivo
├── Api_Gateway/
│   ├── AGENTS.md
│   ├── nginx.conf
│   └── docker-compose.yml
├── Auth/
│   ├── AGENTS.md
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── permissions.py
│   └── docker-compose.yml
├── Producto/
│   ├── AGENTS.md
│   └── api/
├── Proveedor/
│   ├── AGENTS.md
│   └── api/
├── Inventario/
│   ├── AGENTS.md
│   └── api/
├── Calidad/
│   └── AGENTS.md
└── Alertas/
    └── AGENTS.md
```

> **Nota:** Cada AGENTS.md de microservicio contiene información específica de ese servicio y hace referencia a este archivo raíz.