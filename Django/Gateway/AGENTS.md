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

## Middleware JWT

El API Gateway implementa el middleware de validación JWT:

```python
class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Rutas públicas
        if request.path in ['/health/', '/auth/login/']:
            return self.get_response(request)

        token = request.headers.get('Authorization', '').replace('Bearer ', '')

        if not token:
            return JsonResponse({'error': 'Token requerido'}, status=401)

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            # Agregar headers para servicios downstream
            request.META['HTTP_X_USER_ID'] = payload['user_id']
            request.META['HTTP_X_USER_NOMBRE'] = payload['nombre']
            request.META['HTTP_X_USER_ROL'] = payload['rol']
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expirado'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Token inválido'}, status=401)

        return self.get_response(request)
```

## Rutas de servicios

| Servicio | Prefijo |
|----------|---------|
| Auth | /auth/* |
| Catálogo | /catalogo/* |
| Inventario | /inventario/* |
| Calidad | /calidad/* |
| Alertas | /alertas/* |

## Configuración

- JWT_SECRET: clave compartida con todos los servicios
- ALLOWED_HOSTS: dominios permitidos
- Rate limiting opcional (proteger contra ataques)

## Notas específicas

- Este componente puede ser Django, nginx, Traefik, Kong, etc.
- En versión futura: Redis para blacklist de tokens revocados
- Health check: GET /health/ debe retornar 200

## Referencias

- Ver AGENTS.md raíz para arquitectura completa
- skill django-expert: `.agents/skills/django-expert/SKILL.md`