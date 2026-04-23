# AGENTS.md - Inventario Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Microservicio

**Propósito:** Núcleo del sistema - gestión de lotes y movimientos

**Tablas:**
- LOTE (id, codigo_lote, producto_id, proveedor_id, cantidad_inicial, cantidad_actual, fecha_produccion, fecha_entrada, estado)
- MOVIMIENTO (id, lote_id, usuario_id, tipo, cantidad, destino, fecha, observaciones)

**Estados del lote:**
- `REVISION` - Recién registrado, no disponible para salidas
- `APROBADO` - Aprobado por supervisor, disponible para salidas
- `RECHAZADO` - Rechazado en control de calidad
- `AGOTADO` - Sin stock disponible

## Modelo de Datos

### Lote
```python
class Lote(models.Model):
    codigo_lote = models.CharField(max_length=25, unique=True)
    producto_id = models.PositiveIntegerField()
    proveedor_id = models.PositiveIntegerField()
    cantidad_inicial = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_actual = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_produccion = models.DateField()
    fecha_entrada = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO, default='REVISION')

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.cantidad_actual = self.cantidad_inicial
        super(Lote, self).save(*args, **kwargs)
```

**Nota:** Al crear un lote, `cantidad_actual` se inicializa automáticamente con el valor de `cantidad_inicial`.

## Relaciones

- LOTE → PRODUCTO (FK via producto_id)
- LOTE → PROVEEDOR (FK via proveedor_id)
- LOTE → MOVIMIENTO (reverse, related_name='movimientos')
- MOVIMIENTO → LOTE (ForeignKey)
- MOVIMIENTO → USUARIO (ForeignKey)

## Comunicación con Microservicios

Inventario se comunica con otros servicios via HTTP:

```python
PRODUCTO_URL = "http://producto_app:8001"
PROVEEDOR_URL = "http://proveedor_app:8002"
```

### Servicios

| Función | Servicio destino | Propósito |
|---------|----------------|----------|
| `verificar_producto()` | Producto | Validar que existe el producto |
| `verificar_proveedor()` | Proveedor | Validar que existe el proveedor |
| `actualizar_stock_producto()` | Producto | Actualizar stock_actual del producto |

### Headers requeridos

Todos los headers deben incluirse en las peticiones entre servicios:
```python
user_headers = {
    'X-User-ID': request.user_id,
    'X-User-Rol': request.user_rol
}
```

## Flujos de negocio

### 1. Entrada de mercancía (crear lote)
```
1. Operador crea LOTE con cantidad_inicial
2. LOTE.estado = 'REVISION' (default)
3. cantidad_actual = cantidad_inicial (auto en save())
4. Se verifica producto y proveedor en sus servicios
5. No toca stock de Producto hasta aprobación
```

### 2. Aprobación de lote
```
1. Supervisor cambia estado a 'APROBADO'
2. Inventario → PATCH /productos/{id}/ stock_actual
3. Se suma cantidad_inicial al stock_actual de Producto
4. Lote queda disponible para salidas
```

### 3. Rechazo de lote
```
1. Supervisor cambia estado a 'RECHAZADO'
2. Inventario → PATCH /productos/{id}/ stock_actual
3. Se resta cantidad_actual del stock de Producto
```

### 4. Salida de mercancía
```
1. Operador registra MOVIMIENTO tipo 'salida'
2. Se reduce cantidad_actual del lote
3. Cuando cantidad_actual = 0, estado = 'AGOTADO'
4. Se notifica a Alertas para verificar umbrales
```

## Endpoints

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | `/lotes/` | Listar todos los lotes |
| POST | `/lotes/` | Crear nuevo lote |
| GET | `/lotes/{id}/` | Ver detalle de lote |
| PATCH | `/lotes/{id}/` | Actualizar estado del lote |
| GET | `/stock/?producto_id=X` | Consultar stock desde lotes (verificación) |

## Permisos por rol

| Rol | Permisos |
|-----|----------|
| ADMIN | CRUD completo, aprobar/rechazar lotes |
| OPERADOR | Crear lotes, registrar movimientos |
| SUPERVISOR | Aprobar/rechazar lotes |

## Custom Managers

```python
class LoteManager(models.Manager):
    def approved(self):
        return self.filter(estado='APROBADO')
    
    def available(self):
        return self.filter(estado='APROBADO', cantidad_actual__gt=0)
    
    def pending_review(self):
        return self.filter(estado='REVISION')

class MovimientoManager(models.Manager):
    def entradas(self):
        return self.filter(tipo='entrada')
    
    def salidas(self):
        return self.filter(tipo='salida')
    
    def ajustes(self):
        return self.filter(tipo='ajuste')
```

## Patrones a seguir

Seguir las prácticas del skill `django-expert`:
- Custom managers para consultas recurrentes
- DRF con ModelSerializer
- CBV sobre FBV
- select_related/prefetch_related para optimizar queries
- Usar `transaction.atomic()` para operaciones complejas
- Headers trustados para comunicación entre servicios

## Referencias

- Ver AGENTS.md raíz para flujo de negocio completo
- skill django-expert: `.agents/skills/django-expert/SKILL.md`