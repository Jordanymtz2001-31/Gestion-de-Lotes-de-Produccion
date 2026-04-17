# AGENTS.md - Calidad Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Microservicio

**Propósito:** Inspecciones de calidad por lote

**Tablas:**
- REPORTE_CALIDAD (id, lote_id, usuario_id, resultado_tension, resultado_color, resultado_gramaje, resultado_visual, resultado_final, observaciones, fecha)

**Resultados posibles:**
- `Aprobado` - El lote pasa el control de calidad
- `Rechazado` - El lote no cumple los estándares

## Campos de inspección

| Campo | Descripción |
|-------|-------------|
| resultado_tension | Evaluación de tensión del material |
| resultado_color | Evaluación de color |
| resultado_gramaje | Evaluación de gramaje |
| resultado_visual | Evaluación visual general |
| resultado_final | Resultado global (Aprobado/Rechazado) |

## Relaciones

- REPORTE_CALIDAD → LOTE (ForeignKey)
- REPORTE_CALIDAD → USUARIO (ForeignKey, inspector)

## Flujo de negocio

```
1. Supervisor registra inspección de un lote
2. Evalúa: tensión, color, gramaje, aspecto visual
3. Establece resultado_final (Aprobado o Rechazado)
4. Si aprobado → lote puede usarse para salidas
5. Reportes se generan al vuelo (ReportLab/openpyxl)
```

## Permisos por rol

| Rol | Permisos |
|-----|----------|
| admin | CRUD completo |
| operador | Ver reportes |
| supervisor | Registrar inspecciones, aprobar/rechazar lotes |

## Patrones a seguir

Seguir las prácticas del skill `django-expert`:
- DRF con ModelSerializer
- CBV sobre FBV
- select_related para traer datos del lote
- Generar reportes PDF con ReportLab o Excel con openpyxl

## Referencias

- Ver AGENTS.md raíz para flujo de negocio completo
- skill django-expert: `.agents/skills/django-expert/SKILL.md`