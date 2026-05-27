# AGENTS.md - API Gateway

> **Referencia general:** Consultar `AGENTS.md` en la raíz del proyecto para contexto completo.

## Contexto del Proyecto

- Sistema de Gestión de Inventarios Textiles "Textiles la Poblana"
- Stack: Angular 17 + NgRx / Django 5 + DRF + Celery / PostgreSQL / JWT

## Este Componente

**Propósito:** Punto de entrada único - valida JWT y enruta peticiones a servicios

**Responsabilidades:**
- Validar JWT de todas las peticiones
- Agregar headers con información del usuario (X-User-Id, X-User-Nombre, X-User-Rol)
- Enrutar peticiones al servicio correspondiente
- Rutas públicas (sin validación JWT): /health/, /auth/login/

## Flujo de autenticación

```
1. Login:
   Angular → POST /auth/login {email, password}
   Auth genera access_token y lo devuelve

2. Peticiones normales:
   Angular → Header: Authorization: Bearer <access_token>
   API Gateway → valida JWT con JWT_SECRET
             → si válido, agrega headers: X-User-Id, X-User-Nombre, X-User-Rol
             → enruta al servicio correspondiente
   
3. Servicios downstream:
   Reciben headers trustados, NO validan tokens
```

## Validación JWT (nginx auth_request)

El Gateway usa el módulo `auth_request` de nginx para validar JWT:

```nginx
# nginx.conf - Validación JWT
location / {
    # auth_request redirige a /auth-verify con el token
    auth_request /auth-verify;
    # Si es válido, nginx inyecta headers antes de reenviar
    proxy_set_header X-User-ID $http_authorization_user_id;
    proxy_set_header X-User-Rol $http_authorization_user_rol;
    
    # Reenviar al servicio correspondiente
    proxy_pass http://inventario_app:8003;
}

# Subrequest que valida el token
location = /auth-verify {
    # Internal: solo nginx usa esto
    internal;
    proxy_pass http://usuarios_app:8000/usuario/verify/;
    proxy_pass_request_headers off;
}
```

### Flujo nginx
```
1. Petición entra a nginx
2. auth_request /auth-verify → Auth Service (interno)
3. Auth verifica token → retorna headers si válido
4. nginx inyecta X-User-ID, X-User-Rol
5. Reenvía al servicio destino
```

## Rutas de servicios (nginx.conf)

| Servicio | Ruta Nginx | Puerto Contenedor |
|----------|-----------|-------------------|
| Auth | `/usuario/` | usuarios_app:8000 |
| Producto | `/producto/` | producto_app:8001 |
| Proveedor | `/proveedor/` | proveedor_app:8002 |
| Inventario | `/inventario/` | inventario_app:8003 |
| Calidad | `/calidad/` | calidad_app:8004 |
| Alertas | `/alertas/` | alertas_app:8005 |

### Rutas públicas (sin JWT)
- `/usuario/login/`
- `/health/`

## Configuración

### Docker Compose
```yaml
services:
  nginx:
    image: jordany31/api-gateway:dev
    ports:
      - "8080:80"
    networks:
      - gestion_lote_net

networks:
  gestion_lote_net:
    external: true
```

### Variables
- JWT_SECRET: clave compartida con todos los servicios
- Puerto expuesto: 8080
- Red Docker: gestion_lote_net
- Rate limiting opcional (proteger contra ataques)

## Notas específicas

- Este componente puede ser Django, nginx, Traefik, Kong, etc.
- En versión futura: Redis para blacklist de tokens revocados
- Health check: GET /health/ debe retornar 200

## Referencias

- Ver AGENTS.md raíz para arquitectura completa
- skill django-expert: `.agents/skills/django-expert/SKILL.md`