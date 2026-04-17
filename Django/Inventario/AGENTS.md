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
- `En revisión` - Recién registrado, no disponible para salidas
- `Aprobado` - Aprobado por supervisor, disponible para salidas
- `Rechazado` - Rechazado en control de calidad
- `Agotado` - Sin stock disponible

## Relaciones clave

- LOTE → PRODUCTO (ForeignKey)
- LOTE → PROVEEDOR (ForeignKey)
- LOTE → MOVIMIENTO (reverse, related_name='movimientos')
- MOVIMIENTO → LOTE (ForeignKey)
- MOVIMIENTO → USUARIO (ForeignKey)

## Custom Managers sugeridos

```python
class LoteManager(models.Manager):
    def approved(self):
        return self.filter(estado='Aprobado')
    
    def available(self):
        return self.filter(estado='Aprobado', cantidad_actual__gt=0)
    
    def pending_review(self):
        return self.filter(estado='En revisión')

class MovimientoManager(models.Manager):
    def entradas(self):
        return self.filter(tipo='entrada')
    
    def salidas(self):
        return self.filter(tipo='salida')
    
    def ajustes(self):
        return self.filter(tipo='ajuste')
```

## Flujos de negocio

1. **Entrada de mercancía:**
   - Crear LOTE en estado "En revisión"
   - Crear MOVIMIENTO tipo "entrada"

2. **Salida de mercancía:**
   - Validar stock disponible (lotes en estado "Aprobado")
   - Reducir cantidad_actual del lote
   - Crear MOVIMIENTO tipo "salida"
   - Disparar evento a Alertas

3. **Aprobación de lote:**
   - Supervisor cambia estado a "Aprobado"
   - Se suma al stock del producto

## Permisos por rol

| Rol | Permisos |
|-----|----------|
| admin | CRUD completo |
| operador | Registrar entradas, salidas, ajustes |
| supervisor | Aprobación de lotes |

## Patrones a seguir

Seguir las prácticas del skill `django-expert`:
- Custom managers para consultas recurrentes
- DRF con ModelSerializer
- CBV sobre FBV
- select_related/prefetch_related para optimizar queries
- Usar `transaction.atomic()` para operaciones complejas

## Referencias

- Ver AGENTS.md raíz para flujo de negocio completo
- skill django-expert: `.agents/skills/django-expert/SKILL.md`