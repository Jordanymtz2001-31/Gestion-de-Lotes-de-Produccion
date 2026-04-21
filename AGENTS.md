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
/Angular/          → Frontend (Angular 17 + NgRx)
AGENTS.md          → Este archivo
.gitignore        → Archivos ignorados por Git
```

> **Nota:** Todo el contexto técnico del backend Django está documentado en `Django/Agents.md`. Este archivo sirve como índice principal.

---

## 3. Servicios Django

| Servicio | Ubicación | Propósito |
|----------|-----------|-----------|
| **Auth** | `./Django/Auth/` | Autenticación y gestión de usuarios |
| **Catálogo** | `./Django/Catalogo/` | Productos y proveedores |
| **Inventario** | `./Django/Inventario/` | Lotes y movimientos |
| **Calidad** | `./Django/Calidad/` | Inspecciones de calidad |
| **Alertas** | `./Django/Alertas/` | Stock y reportes |
| **Gateway** | `./Django/Api_Gateway/` | Validación JWT y routing (nginx + Django) |

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

### Rutas configuradas

| Ruta | Servicio | Contenedor | Puerto |
|------|----------|------------|--------|
| `/usuario/login/` | Auth | usuarios_app | 8000 |
| `/usuario/` | Auth | usuarios_app | 8000 |
| `/producto/` | Producto | producto_app | 8001 |
| `/proveedor/` | Proveedor | proveedor_app | 8002 |

### Rutas públicas (sin JWT)

- `/usuario/login/`

---

## 6. Gitignored

Ver `.gitignore` para los archivos que no deben subirse al repositorio.