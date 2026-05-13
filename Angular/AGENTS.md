# AGENTS.md - Frontend Angular

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto (`../AGENTS.md`) para contexto completo.

---

## CONDICIÓN DE MANTENIMIENTO ⚠️

**Este archivo debe mantener menos de 500 líneas.**

Al actualizar, seguir estas reglas:
- Usar tablas para lists en lugar de descripciones extensas
- Referenciar archivos en lugar de mostrar código completo
- Sectiones largas → resumir o mover a archivos separados
- Incluir siempre referencia a la skill de diseño

---

## 1. Información del Proyecto

- **Nombre:** Textiles la Poblana - Sistema de Gestión de Inventarios
- **Stack:** Angular 21 + Bootstrap 5 + Design Tokens CSS
- **Puerto:** 4200 | **API Gateway:** `http://localhost:8080/`
- **Ruta:** `./Gestion_Lotes/`

---

## 2. Estado Actual

### ✅ Completado
| Módulo | Componentes |
|--------|-------------|
| **Auth** | Login (JWT) |
| **Dashboard** | KPIs, tabla lotes recientes, acciones rápidas |
| **Productos** | Listar, Crear, Editar, Buscar |
| **Proveedores** | Listar, Crear, Editar, Buscar |
| **Lotes** | Listar, Crear |
| **Usuarios** | Listar, Crear, Editar, Buscar |

### ⏳ Pendiente
- Movimientos (salidas de inventario)
- Aprobación/rechazo de lotes (SUPERVISOR)
- Reportes de calidad
- Alertas de stock bajo

---

## 3. Estructura

```
src/app/
├── core/
│   ├── guards/auth-guard.ts      # authGuard, adminGuard
│   ├── interceptors/             # authService, interceptor
│   └── services/servidor.ts      # HTTP services
├── shared/models/                # usuario, producto, proveedor, lote
├── features/
│   ├── auth/login/               # Login público
│   ├── dashboard/                # Dashboard con KPIs
│   ├── productos/                # CRUD completo
│   ├── proveedores/              # CRUD completo
│   ├── lotes/                    # Listar, guardar
│   └── usuarios/                # CRUD (solo ADMIN)
├── app.routes.ts                # Lazy loading routes
├── app.config.ts                # HTTP + interceptors
└── styles.css                  # Design tokens
```

---

## 4. Rutas

| Path | Rol | Componente |
|------|-----|------------|
| `/login` | Público | Login |
| `/dashboard` | Auth | Dashboard |
| `/listar-productos` | Auth | ListarP |
| `/guardar-producto` | ADMIN | GuardarP |
| `/editar-producto/:id` | ADMIN | EditarP |
| `/listar-proveedores` | Auth | ListarPr |
| `/guardar-proveedor` | ADMIN | GuardarPr |
| `/editar-proveedore/:id` | ADMIN | EditarPr |
| `/listar-lotes` | Auth | ListarL |
| `/guardar-lote` | OPERADOR, ADMIN | GuardarL |
| `/listar-usuarios` | ADMIN | ListarU |

---

## 5. Diseño (Interface Design Skill)

### Design Tokens (`styles.css`)
```css
:root {
  /* Colors */
  --gray-50 to --gray-900
  --primary-500, --primary-600, --primary-700
  --success-500, --warning-500, --danger-500
  
  /* Depth: borders-only */
  --border-subtle, --border-default
  
  /* Spacing: base 4px */
  --space-1 to --space-8
  
  /* Radius */
  --radius-sm, --radius-md, --radius-lg, --radius-xl
}
```

### Principios Aplicados
- Subtle Layering (bordes suaves, sin sombras dramáticas)
- Text hierarchy (4 niveles)
- Spacing consistente
- Color con propósito (semántico)

### Recursos
- **Skill:** `skill:interface-design` cargada
- **Referencia:** `.claude/skills/interface-design/`

---

## 6. Autenticación

1. Login → `POST /usuario/login/` → Recibe token `access`
2. authService guarda en localStorage
3. interceptor agrega `Authorization: Bearer {token}`
4. authGuard / adminGuard protegen rutas

---

## 7. Servicios HTTP

| Entidad | Métodos |
|---------|---------|
| **Usuario** | listar, guardar, editar, eliminar, buscar |
| **Producto** | listar, guardar, editar, eliminar, buscar |
| **Proveedor** | listar, guardar, editar, eliminar, buscar |
| **Lote** | listar, guardar, editar |

---

## 8. Modelos TypeScript

```typescript
interface Usuario   { id, username, email, rol, is_active }
interface Producto { id, nombre, codigo, descripcion, unidad_medida, stock_actual }
interface Proveedor{ id, nombre, telefono, email }
interface Lote     { id, codigo_lote, producto_id, proveedor_id, cantidad_actual, estado }
```

### Estados Lote: REVISION → APROBADO → RECHAZADO | AGOTADO

---

## 9. Comandos

```bash
npm start        # ng serve (4200)
npm run build   # producción
```

---

## 10. Referencias

- Backend: `../../Django/AGENTS.md`
- API Gateway: `../../Django/Api_Gateway/AGENTS.md`
- Interface Design: skill cargada

---

## 11. Pendientes

- [ ] Movimientos (salidas)
- [ ] Aprobación lotes (SUPERVISOR)
- [ ] Calidad
- [ ] Alertas stock