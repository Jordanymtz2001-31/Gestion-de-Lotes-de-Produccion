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
| **Gateway** | `./Django/Gateway/` | Validación JWT y routing |

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

## 5. Gitignored

Ver `.gitignore` para los archivos que no deben subirse al repositorio.