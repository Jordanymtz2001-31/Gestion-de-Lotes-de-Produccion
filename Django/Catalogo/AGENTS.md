# AGENTS.md - Catalogo Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Microservicio

**Propósito:** Catálogo maestro de productos y proveedores

**Tablas:**
- PRODUCTO (id, nombre, codigo, unidad_medida, stock_actual)
- PROVEEDOR (id, nombre, contacto, telefono, email)

**Relaciones:**
- PRODUCTO tiene muchos LOTE (related_name='lotes')
- PROVEEDOR tiene muchos LOTE (related_name='lotes')

## Por que ambas tablas aqui?
- El problema es que un Lote necesita tanto el producto_id como el proveedor_id al mismo tiempo. Si están en servicios separados, cuando el servicio de Inventario crea un lote tiene que validar que ese producto existe llamando a Productos, y que ese proveedor existe llamando a Proveedores — dos llamadas REST en lugar de una. Y si una falla, tienes que manejar ese error a la mitad de la operación

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

## Referencias

- Ver AGENTS.md raíz para flujo de negocio completo
- skill django-expert: `.agents/skills/django-expert/SKILL.md`