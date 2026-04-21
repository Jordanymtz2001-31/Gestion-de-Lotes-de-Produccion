# Sistema de Gestión de Inventarios Textiles - Textiles la Poblana

> **Nota:** Esta guía sigue las mejores prácticas del skill `django-expert`. Consultar `.agents/skills/django-expert/SKILL.md` y sus referencias para detalles técnicos adicionales.

---

## 1. Información General del Proyecto

- **Nombre:** Textiles la Poblana - Sistema de Gestión de Inventarios
- **Stack:** Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT
- **Frontend:** Angular 17 (no usa templates Django)
- **Descripción:** Sistema de gestión de inventarios textiles con control de lotes, movimientos, calidad y alertas de stock

---

## 2. Arquitectura de Microservicios

El sistema está compuesto por 5 servicios independientes con API Gateway:

| Servicio | Tablas | Propósito |
|----------|--------|-----------|
| **API Gateway** | - | Valida JWT, enruta peticiones a servicios |
| **Auth** | USUARIO | Login, generación JWT, gestión de usuarios |
| **Catálogo** | PRODUCTO, PROVEEDOR | Catálogo maestro de productos y proveedores |
| **Inventario** | LOTE, MOVIMIENTO | Núcleo del sistema: gestión de lotes y movimientos |
| **Calidad** | REPORTE_CALIDAD | Inspecciones de calidad por lote |
| **Alertas** | ALERTA_STOCK | Monitoreo de stock y generación de reportes PDF/Excel |

---

## 3. API Gateway

> **Para más detalles:** Consultar `./Gateway/AGENTS.md`

El API Gateway es el punto de entrada único del sistema. Todas las peticiones pasan por él.

### Responsabilidades

1. **Validación JWT**: Verifica el token de cada petición
2. **Headers de contexto**: Agrega información del usuario para los servicios
3. **Enrutamiento**: Dirige las peticiones al servicio correspondiente
4. **Rutas públicas**: Permite acceso sin token a `/health/` y `/auth/login/`

### Headers agregados

Cuando el JWT es válido, el Gateway agrega:
- `X-User-Id`: ID del usuario
- `X-User-Nombre`: Nombre del usuario
- `X-User-Rol`: Rol del usuario (admin, operador, supervisor)

### Rutas de servicios

| Servicio | Prefijo |
|----------|---------|
| Auth | /auth/* |
| Catálogo | /catalogo/* |
| Inventario | /inventario/* |
| Calidad | /calidad/* |
| Alertas | /alertas/* |

---

## 4. Comunicación entre Microservicios

> **Importante:** Para detalles específicos de cada servicio, consultar su AGENTS.md respectivo:
> - Auth: `./Auth/AGENTS.md`
> - Catálogo: `./Catalogo/AGENTS.md`
> - Inventario: `./Inventario/AGENTS.md`
> - Calidad: `./Calidad/AGENTS.md`
> - Alertas: `./Alertas/AGENTS.md`

### Flujo de comunicación

```
Angular (Frontend)
    │
    ▼
API Gateway (valida JWT, agrega headers)
    │
    ├─► Auth Service    (/auth/*)
    ├─► Catalogo Service (/catalogo/*)
    ├─► Inventario Service (/inventario/*)
    ├─► Calidad Service (/calidad/*)
    └─► Alertas Service (/alertas/*)
```

### Comunicación servicio a servicio

Los servicios pueden comunicarse entre sí:

- **Inventario → Alertas**: Cuando se registra una salida, Inventario notifica a Alertas para verificar stock
- **Calidad → Inventario**: Cuando se aprueba un lote, Calidad notifica a Inventario para actualizar estado

> **Nota:** En versión futura se usará Redis + Celery para esta comunicación asíncrona.

### Headers trustados

Los servicios reciben los headers del Gateway y confían en ellos (no validan el JWT nuevamente):
- `request.META['HTTP_X_USER_ID']`
- `request.META['HTTP_X_USER_NOMBRE']`
- `request.META['HTTP_X_USER_ROL']`

---

## 5. Modelo de Datos (ERD Simplificado)

### Entidades principales

**USUARIO**
- id (PK)
- nombre
- email (único)
- rol (admin, operador, supervisor)
- password_hash

**PROVEEDOR**
- id (PK)
- nombre
- contacto
- telefono
- email

**PRODUCTO**
- id (PK)
- nombre
- codigo (único)
- unidad_medida
- stock_actual (calculado dinámicamente)

**LOTE**
- id (PK)
- codigo_lote (único)
- producto_id (FK → PRODUCTO)
- proveedor_id (FK → PROVEEDOR)
- cantidad_inicial (fijo, histórico)
- cantidad_actual (variable)
- fecha_produccion
- fecha_entrada
- estado (En revisión / Aprobado / Rechazado / Agotado)

**MOVIMIENTO**
- id (PK)
- lote_id (FK → LOTE)
- usuario_id (FK → USUARIO)
- tipo (entrada / salida / ajuste)
- cantidad
- destino (nullable, solo para salidas)
- fecha
- observaciones

**ALERTA_STOCK**
- id (PK)
- producto_id (FK → PRODUCTO)
- umbral_minimo
- umbral_critico
- activa (boolean)
- fecha_generada

**REPORTE_CALIDAD**
- id (PK)
- lote_id (FK → LOTE)
- usuario_id (FK → USUARIO)
- resultado_tension
- resultado_color
- resultado_gramaje
- resultado_visual
- resultado_final (Aprobado / Rechazado)
- observaciones
- fecha

### Relaciones clave

- **stock_actual** = suma de `cantidad_actual` de todos los lotes del producto en estado "Aprobado"
- **cantidad_inicial** nunca cambia (registro histórico de lo que llegó)
- **cantidad_actual** disminuye con cada salida o ajuste
- Un lote nace en "En revisión" → no puede usarse para salidas hasta ser aprobado por supervisor

---

## 5. Sistema de Autenticación JWT

### Decisión de diseño

**Versión actual:** JWT con access token largo (sin refresh token)

- Access token con validez extendida (ej: 1 días)
- Validación puramente por firma criptográfica (sin estado en servidor)
- No requiere almacenamiento de tokens

**Nota:** En versión futura se implementará Redis para:
- Blacklist de tokens revocados
- Cola de eventos entre servicios

### Estructura del token

El access token JWT contiene:
```json
{
  "user_id": 1,
  "nombre": "Juan Pérez",
  "rol": "admin",
  "exp": <timestamp>
}
```

### Flujo de autenticación

```
1. Login:
   Angular → POST /auth/login {email, password}
   Auth valida credenciales → genera access_token (firma con JWT_SECRET)
   Auth devuelve access_token → Angular lo guarda en memoria

2. Peticiones normales:
   Angular → Header: Authorization: Bearer <access_token>
   API Gateway → verifica firma JWT con JWT_SECRET
              → agrega headers: X-User-Id, X-User-Nombre, X-User-Rol
              → enruta al servicio correspondiente
   Servicio → lee headers trustados (no verifica token)

3. Logout:
   Angular limpia el token de memoria
   (No hay revocación en esta versión)
```

### API Gateway (validación JWT)

El API Gateway es responsable de validar el JWT y agregar headers para los servicios:

```python
# API Gateway middleware
import jwt
from django.conf import settings

SECRET_KEY = settings.JWT_SECRET

class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in ['/health/', '/auth/login/']:
            return self.get_response(request)

        token = request.headers.get('Authorization', '').replace('Bearer ', '')

        if not token:
            return JsonResponse({'error': 'Token requerido'}, status=401)

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            # Agregar headers para servicios downstream
            request.META['HTTP_X_USER_ID'] = payload['user_id']
            request.META['HTTP_X_USER_NOMBRE'] = payload['nombre']
            request.META['HTTP_X_USER_ROL'] = payload['rol']
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expirado'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Token inválido'}, status=401)

        return self.get_response(request)
```

### Permisos por rol

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total a todos los endpoints |
| **operador** | Registrar entradas, salidas, ajustes de inventario |
| **supervisor** | Aprobación de lotes, reportes de calidad |

Ejemplo de verificación en vista (servicio):
```python
# En el servicio, se lee el header agregado por API Gateway
def registrar_entrada(request):
    rol = request.META.get('HTTP_X_USER_ROL')
    if rol not in ['operador', 'admin']:
        return JsonResponse({'error': 'Sin permiso'}, status=403)
    # lógica de la vista
```

---

## 6. Patrones Django/DRF

> ⚠️ **Importante:** Consultar skill `django-expert` en `.agents/skills/django-expert/` para detalles completos.

Esta sección sigue las mejores prácticas del skill django-expert.

### Modelos y Custom Managers

**¿Cuándo usar custom managers?**

Usar para lógica de negocio recurrente que se usa en múltiples lugares:

```python
# Managers personalizados - usar cuando la misma query se repite
class LoteManager(models.Manager):
    def approved(self):
        """Lotes aprobados"""
        return self.filter(estado='Aprobado')

    def available(self):
        """Lotes con stock disponible"""
        return self.filter(estado='Aprobado', cantidad_actual__gt=0)

    def pending_review(self):
        """Lotes en revisión"""
        return self.filter(estado='En revisión')

class Lote(models.Model):
    codigo_lote = models.CharField(max_length=50, unique=True)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='lotes')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='lotes')
    cantidad_inicial = models.PositiveIntegerField()
    cantidad_actual = models.PositiveIntegerField()
    fecha_produccion = models.DateField()
    fecha_entrada = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    
    objects = LoteManager()  # Custom manager
```

**Otros ejemplos de custom managers útiles:**
- `Producto.objects.with_low_stock()` - productos bajo umbral
- `Movimiento.objects.entradas()` / `salidas()` - filtrar por tipo
- `AlertaStock.objects.activas()` - solo alertas activas

### Views y DRF

- Preferir **Class-Based Views (CBV)** sobre Function-Based Views (FBV)
- DRF: usar `ModelSerializer` para operaciones CRUD estándar
- Usar `ViewSet` con `Router` para endpoints RESTful automáticos
- Implementar paginación (`PageNumberPagination`) y filtrado
- Separar lógica de negocio en **servicios** (no tutto en views)

```python
class LoteViewSet(ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Lote.objects.filter(
            producto_id=self.request.query_params.get('producto')
        )
```

### Optimización de consultas

- `select_related()` → FK y OneToOne (trae datos en la misma consulta)
- `prefetch_related()` → reverse FK y ManyToMany (consulta adicional)
- Evitar **N+1 queries** en serializers usando prefetch
- Usar `only()` o `defer()` cuando no necesitas todos los campos
- Usar `values()` o `values_list()` para consultas que no necesitan objetos completos

```python
# Malo (N+1):
lotes = Lote.objects.all()
for lote in lotes:
    print(lote.producto.nombre)  # consulta por cada lote

# Bueno:
lotes = Lote.objects.select_related('producto').all()
```

### Seguridad

- **SQL Injection**: Siempre usar ORM, nunca SQL plano
- **Passwords**: Usar `make_password()` de Django, nunca almacenar texto plano
- **Permissions**: DRF permission classes personalizadas

```python
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        rol = request.META.get('HTTP_X_USER_ROL')
        return rol == 'admin'
```

### Configuración de producción

```
DEBUG = False
SECRET_KEY = <valor seguro, no usar en código>
ALLOWED_HOSTS = ['dominio.com']
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
```

- Static/Media: servir con nginx o cloud storage (AWS S3, CloudFlare R2)
- Database: usar conexión pooling (puede usar pgbouncer si hay muchas conexiones)
- Logging: configurar para monitoreo (Sentry recomendado)
- Health check: endpoint `/health/` que retorna 200 si la app responde

---

## 7. Flujos de Negocio Clave

### Flujo 1: Aprobación de lotes

```
1. Lote se crea → estado inicial: "En revisión"
2. Operador registra entrada de mercancía
3. Supervisor revisa el lote (verifica cantidad, calidad)
4. Supervisor aprueba o rechaza el lote
   - Si Aprobado → estado = "Aprobado" → se suma al stock del producto
   - Si Rechazado → estado = "Rechazado" → no se usa para salidas
```

### Flujo 2: Movimientos de inventario

```
Entrada:
- Se registra nueva entrada de mercancía
- Se crea LOTE en estado "En revisión"
- Se crea MOVIMIENTO tipo "entrada"

Salida:
- Se valida que haya stock disponible (lotes en estado "Aprobado")
- Se reduce cantidad_actual del lote
- Se crea MOVIMIENTO tipo "salida"
- Se dispara evento a Alertas para verificar umbrales

Ajuste:
- Se registra diferencia (positiva o negativa) con justificación
- Se crea MOVIMIENTO tipo "ajuste"
```

### Flujo 3: Alertas de stock

```
1. Cada movimiento de salida/ajuste dispara evento
2. Alertas recibe el evento y recalcula stock remaining
3. Compara con umbrales del producto:
   - Si stock < umbral_mínimo → genera alerta (advertencia)
   - Si stock < umbral_critico → genera alerta (urgente)
4. Alertas activas se pueden consultar desde el frontend
```

### Flujo 4: Reportes de calidad

```
1. Supervisor registra inspección de un lote
2. Se evalúan: tensión, color, gramaje, aspecto visual
3. Se establece resultado final: Aprobado o Rechazado
4. Si aprobado → lote puede usarse para salidas
5. Reportes se generan al vuelo (ReportLab/openpyxl)
```

---

## 8. Pendientes Técnicos

- [ ] Implementar Redis para blacklist de tokens (futuro)
- [ ] Implementar cola de eventos con Celery + Redis
- [ ] Configurar health checks en cada servicio
- [ ] Definir estructura de URLs por microservicio
- [ ] Implementar tests unitarios por servicio

---

## 9. Estructura de AGENTS por Microservicio

Cada microservicio tiene su propio `AGENTS.md` con contexto específico:

| Microservicio | Ubicación | Propósito |
|---------------|-----------|-----------|
| **Auth** | `./Auth/AGENTS.md` | Autenticación y gestión de usuarios |
| **Catálogo** | `./Catalogo/AGENTS.md` | Productos y proveedores |
| **Inventario** | `./Inventario/AGENTS.md` | Lotes y movimientos |
| **Calidad** | `./Calidad/AGENTS.md` | Inspecciones de calidad |
| **Alertas** | `./Alertas/AGENTS.md` | Stock y reportes |
| **Gateway** | `./Gateway/AGENTS.md` | Validación JWT y routing |

> **Nota:** Cada AGENTS.md de microservicio hace referencia al AGENTS.md raíz para contexto completo del proyecto.