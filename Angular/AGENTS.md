# AGENTS.md - Frontend Angular

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto (`../AGENTS.md`) para contexto completo.

---

## 1. Información del Proyecto

- **Nombre:** Textiles la Poblana - Sistema de Gestión de Inventarios
- **Stack Frontend:** Angular 21 + Bootstrap 5 + SweetAlert2
- **Puerto desarrollo:** 4200
- **Ruta:** `./Gestion_Lotes/`
- **API Gateway:** `http://localhost:8080/`

---

## 2. Estado Actual del Proyecto

### ✅ Implementado

| Módulo | Funcionalidad | Estado |
|--------|--------------|--------|
| **Auth** | Login con JWT | ✅ Completado |
| **Usuarios** | Listar, Crear, Editar, Buscar | ✅ Completado |
| **Productos** | Listar, Crear, Editar, Buscar | ✅ Completado |
| **Proveedores** | Listar, Crear, Editar, Buscar | ✅ Completado |
| **Lotes** | Listar, Crear | ✅ Completado |
| **Navbar** | Navegación según rol | ✅ Completado |

### 🔄 Pendiente

- Movimientos de inventario (salidas)
- Aprobación/rechazo de lotes (SUPERVISOR)
- Reportes de calidad
- Dashboard de alertas de stock

---

## 3. Estructura del Proyecto

```
Angular/Gestion_Lotes/src/app/
├── core/
│   ├── guards/
│   │   └── auth-guard.ts        # authGuard, adminGuard
│   ├── interceptors/
│   │   ├── authService.ts       # Servicio de auth (token)
│   │   └── interceptor.ts      # HttpInterceptor para token
│   └── services/
│       └── servidor.ts          # Servicios HTTP (API Gateway)
├── shared/
│   ├── components/
│   │   └── navbar/              # Navbar dinámico por rol
│   └── models/
│       ├── usuario.ts
│       ├── producto.ts
│       ├── proveedor.ts
│       └── lote.ts
├── features/
│   ├── auth/login/              # Login público
│   ├── usuarios/
│   │   ├── listar-u/            # Solo ADMIN
│   │   ├── guardar-u/           # Solo ADMIN
│   │   ├── buscar-u/
│   │   └── editar-u/            # Solo ADMIN
│   ├── productos/
│   │   ├── listar-p/            # Login requerido
│   │   ├── guardar-p/           # Solo ADMIN
│   │   ├── buscar-p/
│   │   └── editar-p/            # Solo ADMIN
│   ├── proveedores/
│   │   ├── listar-pr/           # Login requerido
│   │   ├── guardar-pr/          # Solo ADMIN
│   │   ├── buscar-pr/
│   │   └── editar-pr/           # Solo ADMIN
│   └── lotes/
│       ├── listar-l/            # Login requerido
│       └── guardar-l/           # OPERADOR, ADMIN
├── app.routes.ts                # Rutas con lazy loading
├── app.config.ts                # Configuración global
└── app.ts                       # Componente raíz
```

---

## 4. Rutas Implementadas

### Rutas Públicas
| Path | Componente | Descripción |
|------|------------|-------------|
| `/login` | Login | Página de login |

### Rutas Protegidas (authGuard)
| Path | Rol | Descripción |
|------|-----|-------------|
| `/listar-lotes` | Todos | Listar lotes |
| `/listar-productos` | Todos | Listar productos |
| `/listar-proveedores` | Todos | Listar proveedores |
| `/guardar-lote` | OPERADOR, ADMIN | Crear lote |

### Rutas Admin (authGuard + adminGuard)
| Path | Descripción |
|------|-------------|
| `/listar-usuario` | Listar usuarios |
| `/guardar-usuario` | Crear usuario |
| `/editar-usuario` | Editar usuario |
| `/guardar-producto` | Crear producto |
| `/editar-producto` | Editar producto |
| `/guardar-proveedor` | Crear proveedor |
| `/editar-proveedore` | Editar proveedor |

---

## 5. Servicios HTTP (servidor.ts)

```typescript
// Base URL
private BASE_URL = 'http://localhost:8080/';

// USUARIOS
listarUsuarios(): Observable<Usuario[]>
guardarUsuario(usuario: Usuario)
editarUsuario(id: number, usuario: Usuario)
eliminarUsuario(id: number)
buscarUsuario(id: number)

// PRODUCTOS
listarProductos(): Observable<Producto[]>
guardarProducto(producto: Producto)
editarProducto(id: number, producto: Producto)
eliminarProducto(id: number)
buscarProducto(id: number)

// PROVEEDORES
listarProveedores(): Observable<Proveedor[]>
guardarProveedor(proveedor: Proveedor)
editarProveedor(id: number, proveedor: Proveedor)
eliminarProveedor(id: number)
buscarProveedor(id: number)

// LOTES
listarLotes(): Observable<Lote[]>
guardarLote(lote: Lote)
editarLote(id: number, lote: Lote)
// eliminarLote() - No implementado (no se eliminan lotes)
```

---

## 6. Autenticación

### Flujo
1. Login → POST `/usuario/login/` → Recibe `access` token
2. Token se guarda en memoria (authService)
3. Interceptor agrega `Authorization: Bearer {token}` a cada request
4. Guards verifican token y rol para acceso a rutas

### Guards
```typescript
authGuard     // Verifica que tenga token (cualquier rol)
adminGuard    // Verifica que el rol sea ADMIN
```

---

## 7. Modelos TypeScript

```typescript
// usuario.ts
interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: 'ADMIN' | 'OPERADOR' | 'SUPERVISOR';
  is_active: boolean;
  date_joined: string;
}

// producto.ts
interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  unidad_medida: string;
  stock_actual: number;
}

// proveedor.ts
interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
}

// lote.ts
interface Lote {
  id: number;
  codigo_lote: string;
  producto_id: number;
  proveedor_id: number;
  cantidad_inicial: number;
  cantidad_actual: number;
  fecha_produccion: string;
  fecha_entrada: string;
  estado: 'REVISION' | 'APROBADO' | 'RECHAZADO' | 'AGOTADO';
}
```

---

## 8. Estados de Lote

| Estado | Descripción | Disponible para Salida |
|--------|-------------|----------------------|
| REVISION | Recién registrado | ❌ No |
| APROBADO | Aprobado por supervisor | ✅ Sí |
| RECHAZADO | No cumple estándares | ❌ No |
| AGOTADO | Sin stock | ❌ No |

---

## 9. Permisos por Rol

| Rol | Usuarios | Productos | Proveedores | Lotes |
|-----|----------|-----------|-------------|-------|
| **ADMIN** | CRUD | CRUD | CRUD | Crear |
| **OPERADOR** | Ver | Ver | Ver | Crear |
| **SUPERVISOR** | Ver | Ver | Ver | Ver + Cambiar estado |

---

## 10. Dependencias

```json
{
  "@angular/core": "^21.1.0",
  "bootstrap": "^5.3.8",
  "sweetalert2": "^11.26.24",
  "rxjs": "~7.8.0"
}
```

---

## 11. Comandos Útiles

```bash
# Servidor desarrollo
npm start          # ng serve (puerto 4200)

# Compilar producción
npm run build      # ng build

# Tests
npm test           # ng test
```

---

## 12. Integración con Backend

### Headers en peticiones
```typescript
// Interceptor agrega token automáticamente
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Manejo de errores con SweetAlert2
```typescript
Swal.fire({
  title: 'Error',
  text: 'Credenciales inválidas',
  icon: 'error'
});
```

---

## 13. Pendientes Técnicos

- [ ] Implementar movimientos (salidas de inventario)
- [ ] Aprobación/rechazo de lotes (SUPERVISOR)
- [ ] Reportes de calidad
- [ ] Dashboard de alertas de stock
- [ ] Tests unitarios con Vitest

---

## 14. Referencias

- **Backend Django:** `../../Django/Agents.md`
- **API Gateway:** `../../Django/Api_Gateway/AGENTS.md`
- **Skill Interface Design:** ✅ Instalada