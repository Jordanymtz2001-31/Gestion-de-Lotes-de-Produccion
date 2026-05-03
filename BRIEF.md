# Brief del Proyecto: Textiles la Poblana

## 1. Información General

**Nombre del proyecto:** Textiles la Poblana - Sistema de Gestión de Inventarios Textiles

**Tipo de aplicación:** Sistema de gestión empresarial (SaaS)

**Descripción:** Plataforma para gestionar inventarios textiles con control de lotes, movimientos de mercancía, control de calidad y alertas automáticas de stock.

---

## 2. Problema que Resuelve

Las empresas textiles enfrentan problemas como:
- Inventario desorganizado sin trazabilidad de lotes
- Dificultad para rastrear la fecha de producción y proveedor de cada producto
- Stock desactualizado que genera faltantes o sobrantes
- Falta de control de calidad al recibir mercancía
- Proceso manual de alertas cuando el stock baja de umbrales críticos

---

## 3. Solución Propuesta

Sistema web con arquitectura de microservicios que permite:
- **Gestión de lotes**: Registrar cada entrada de mercancía con código único, fecha de producción, proveedor y cantidad
- **Control de movimientos**: Registrar entradas y salidas de mercancía con trazabilidad completa
- **Estados de lote**: REVISION → APROBADO/RECHAZADO → AGOTADO
- **Stock centralizado**: El stock del producto se calcula dinámicamente desde los lotes aprobados
- **Alertas automáticas**: Notificaciones cuando el stock baja de umbrales definidos

---

## 4. Funcionalidades Principales

### Módulo de Productos
- Catálogo maestro de productos textiles
- Código único, nombre, descripción, unidad de medida (metro/kg/rollo)
- Stock actual calculado dinámicamente

### Módulo de Proveedores
- Registro de proveedores con datos de contacto
- Historial de entregas por proveedor

### Módulo de Inventario (Núcleo)
- **Crear lote**: Registrar entrada de mercancía con código único
- **Aprobar/rechazar lote**: El supervisor evalúa y aprueba o rechaza
- **Movimientos**: Registrar salidas de mercancía
- **Stock disponible**: Ver stock por producto desde lotes aprobados

### Módulo de Calidad (Pendiente)
- Inspecciones de calidad de lotes
- Reportes de rechazo con evidencia

### Módulo de Alertas (Pendiente)
- Notificaciones automáticas por email/webhook
- Alertas de stock bajo umbral

---

## 7. Modelo de Datos Clave

### PRODUCTO
- id, nombre, código (único), descripción, unidad_medida, stock_actual

### PROVEEDOR
- id, nombre, email, teléfono, dirección

### LOTE
- id, código_lote (único), producto_id, proveedor_id
- cantidad_inicial, cantidad_actual (se reduce con salidas)
- fecha_produccion, fecha_entrada
- estado: REVISION → APROBADO/RECHAZADO → AGOTADO

### MOVIMIENTO
- id, lote_id, usuario_id, tipo (entrada/salida/ajuste)
- cantidad, destino, observaciones, fecha

---

## 8. Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total: CRUD usuarios, productos, proveedores, lotes, movimientos |
| **SUPERVISOR** | Aprobar/rechazar lotes, ver todo |
| **OPERADOR** | Crear lotes, registrar movimientos, ver inventario |

---

## 9. Estado Actual del Proyecto

### ✅ Implementado
- Auth Service (usuarios, login JWT)
- Producto Service (catálogo)
- Proveedor Service (catálogo)
- Inventario Service (lotes, movimientos)
- API Gateway (nginx con auth_request JWT)

---

## 10. Flujo de Negocio Principal

```
1. OPERADOR crea un LOTE (entrada de mercancía)
   → Estado inicial: REVISION
   → cantidad_actual = cantidad_inicial

2. SUPERVISOR revisa el lote
   → Si approved: Lote queda disponible para salidas, se actualiza stock del producto
   → Si rejected: Lote rechazado, no afecta stock

3. OPERADOR registra MOVIMIENTO de salida
   → Se reduce cantidad_actual del lote
   → Si cantidad_actual = 0, lote pasa a AGOTADO

4. ALERTAS verifica umbrales de stock
   → Si stock < umbral → Notificación automática
```

---
