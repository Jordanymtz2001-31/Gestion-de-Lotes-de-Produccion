# Sistema de Gestión de Inventarios Textiles

> **Nota:** Este proyecto sigue las mejores prácticas del skill `django-expert`. Consultar referencia en `./Django/.agents/skills/django-expert/SKILL.md`.

---

## 1. Información General

- **Nombre:** Textiles la Poblana - Sistema de Gestión de Inventarios
- **Stack:** Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT
- **Descripción:** Sistema de gestión de inventarios textiles con control de lotes, movimientos, calidad y alertas de stock

---

## 2. Estructura del Proyecto

```
/Django/           → Backend (Django + DRF)
  ├── Api_Gateway/ → nginx + JWT validation
  ├── Auth/        → Autenticación (puerto 8000)
  ├── Producto/    → Productos (puerto 8001)
  ├── Proveedor/   → Proveedores (puerto 8002)
  ├── Inventario/ → Lotes y movimientos (puerto 8003)
  ├── Calidad/    → Inspecciones (puerto 8004)
  └── Alertas/    → Stock y reportes (puerto 8005)
/Angular/          → Frontend (Angular 17 + NgRx)
AGENTS.md          → Este archivo
.gitignore        → Archivos ignorados por Git
```

> **Nota:** Todo el contexto técnico del backend Django está documentado en `Django/Agents.md`. Este archivo sirve como índice principal.

---

## 3. Servicios Django

| Servicio | Puerto | Ubicación | Propósito |
|----------|--------|-----------|-----------|
| **API Gateway** | 8080 | `./Django/Api_Gateway/` | Validación JWT (nginx) |
| **Auth** | 8000 | `./Django/Auth/` | Autenticación y gestión de usuarios |
| **Producto** | 8001 | `./Django/Producto/` | Catálogo de productos |
| **Proveedor** | 8002 | `./Django/Proveedor/` | Catálogo de proveedores |
| **Inventario** | 8003 | `./Django/Inventario/` | Lotes y movimientos |
| **Calidad** | 8004 | `./Django/Calidad/` | Inspecciones de calidad |
| **Alertas** | 8005 | `./Django/Alertas/` | Stock y reportes |

---

## 4. Comandos Útiles

### Django
```bash
# Activar venv
cd Django/Auth && venv\Scripts\activate

# Migraciones
python manage.py makemigrations
python manage.py migrate

# Servidor desarrollo
python manage.py runserver
```

---

## 5. API Gateway (nginx + Django)

> **Detalles técnicos:** `./Django/Api_Gateway/AGENTS.md`

El API Gateway es el punto de entrada único. Toda petición pasa por él antes de llegar a los servicios.

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      nginx:80                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              auth_request /auth-verify           │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │ (subrequest interna)               │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │         Django Auth Service                 │     │
│  │         /usuario/verify/                    │     │
│  └──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │ Headers trustados      │
              │ X-User-ID, X-User-Rol│
              └────────────┬────────────┘
                          ▼
        ┌─────────────────┬─────────────────┬──────────┐
        ▼                 ▼                 ▼          ▼
   /usuario/*       /producto/*     /proveedor/*   (futuro)
   usuarios_app     producto_app   proveedor_app
   :8000            :8001           :8002
```

### Flujo de validación JWT

1. Cliente → nginx (puerto 80)
2. nginx hace `auth_request /auth-verify` (subpetición interna)
3. Auth Service valida token → devuelve headers si es válido
4. nginx inyecta `X-User-ID` y `X-User-Rol` en la petición
5. Petición reenviada al servicio destino

### Rutas configuradas (puerto 8080)

| Ruta | Servicio | Puerto |
|------|----------|--------|
| `/usuario/` | Auth | 8000 |
| `/producto/` | Producto | 8001 |
| `/proveedor/` | Proveedor | 8002 |
| `/inventario/` | Inventario | 8003 |

### Rutas públicas (sin JWT)

- `/usuario/login/`
- `/health/`

---

## 6. Gitignored

Ver `.gitignore` para los archivos que no deben subirse al repositorio.