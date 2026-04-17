# AGENTS.md - Auth Service

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Microservicio

**Propósito:** Autenticación y gestión de usuarios

**Tablas:**
- USUARIO (id, nombre, email, rol, password_hash)

**Endpoints principales:**
- Login
- Logout
- Registro de usuarios

## Configuración JWT

- Access token: válido por 7 días
- Validación: el API Gateway valida el token y agrega headers (X-User-Id, X-User-Rol)
- Este servicio recibe los headers trustados, no valida tokens

## Roles disponibles

| Rol | Descripción |
|-----|-------------|
| admin | Acceso total |
| operador | Registros de inventario |
| supervisor | Aprobación de lotes, calidad |

## Patrones a seguir

Seguir las prácticas del skill `django-expert`:
- Custom managers para consultas recurrentes
- DRF con ModelSerializer
- CBV sobre FBV
- select_related/prefetch_related para optimizar queries

## Notas específicas

- Este servicio es el encargado de generar los tokens JWT
- La clave JWT_SECRET debe ser la misma en todos los servicios
- En versión futura: Redis para blacklist de tokens