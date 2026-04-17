# AGENTS.md - Alertas Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Microservicio

**Propósito:** Monitoreo de stock y generación de reportes PDF/Excel

**Tablas:**
- ALERTA_STOCK (id, producto_id, umbral_minimo, umbral_critico, activa, fecha_generada)

## Niveles de alerta

| Nivel | Condición |
|-------|------------|
| Advertencia | stock < umbral_minimo |
| Crítica | stock < umbral_critico |

## Flujo de negocio

```
1. Cada movimiento de salida/ajuste dispara evento
2. Alertas recibe el evento y recalcula stock remaining
3. Compara con umbrales del producto:
   - Si stock < umbral_minimo → genera alerta (advertencia)
   - Si stock < umbral_critico → genera alerta (urgente)
4. Alertas activas se pueden consultar desde el frontend
```

## Cálculo de stock

El stock de un producto = suma de `cantidad_actual` de todos los lotes en estado "Aprobado"

## Custom Managers sugeridos

```python
class AlertaStockManager(models.Manager):
    def activas(self):
        return self.filter(activa=True)
    
    def criticas(self):
        return self.filter(activa=True, critico=True)
```

## Permisos por rol

| Rol | Permisos |
|-----|----------|
| admin | CRUD completo, ver todas las alertas |
| operador | Ver alertas |
| supervisor | Ver y gestionar alertas |

## Reportes

Los reportes se generan al vuelo:
- PDF: ReportLab
- Excel: openpyxl

## Patrones a seguir

Seguir las prácticas del skill `django-expert`:
- Custom managers para consultas recurrentes (alertas activas, críticas)
- DRF con ModelSerializer
- CBV sobre FBV
- select_related para traer datos del producto
- Usar signals o eventos para recalcular stock

## Notas específicas

- Este servicio escucha eventos de otros servicios (Inventario)
- En versión futura: Redis para cola de eventos
- Los reportes se generan dinámicamente, no se almacenan en DB

## Referencias

- Ver AGENTS.md raíz para flujo de negocio completo
- skill django-expert: `.agents/skills/django-expert/SKILL.md`