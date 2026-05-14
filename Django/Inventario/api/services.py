import requests
from decimal import Decimal
from rest_framework import status
from rest_framework.response import Response

#Apuntamos directamente a los microservicios sin pasar por el api gateway
PRODUCTO_URL = "http://producto_app:8001"
PROVEEDOR_URL = "http://proveedor_app:8002"

# Metodo para verificar si existe el producto que estamos creando el lote
def verificar_producto(producto_id, user_headers):
    """
    Verifica que un producto existe en el microservicio de Productos.

    Realiza una petición GET interna al servicio de Productos usando
    la red Docker. Los user_headers son necesarios para que el
    GatewayAuthMiddleware del servicio destino no rechace la petición.

    Args:
        producto_id (int): ID del producto a verificar.
        user_headers (dict): Headers con X-User-ID y X-User-Rol
                            extraídos del request original.

    Returns:
        dict: Resultado de la operación con la siguiente estructura:
            - Éxito:  {"valido": True,  "data": {...}}
            - Fallo:  {"valido": False, "error": "mensaje"}
    """
    url = f"{PRODUCTO_URL}/productos/{producto_id}/"
    print(f"HEADERS RECIBIDOS: {user_headers}")

    try:
        existe_producto = requests.get(url, headers=user_headers, timeout=5)
        print(f"Respuesta: {existe_producto.text}") 
        # Si detecta un error lanza una exceptcion de la libreria de requests si el status code es 400 o 500
        # y pasa directo a exception.HTTPError
        existe_producto.raise_for_status()
        # Devolvos el producto en caso de que exista con su informacion y estaus 200
        return {"Valido": True, "data": existe_producto.json()}

    # {"Valido": True..} Es un indicador interno para que la vista sepa si la operacion fue exitosa o no
    # para que en mi vista no necesita saber nada de requets(peticiones), exceptiones HTTP y solo pregunta si es Valido
    except requests.exceptions.HTTPError as err:
        status_code = err.response.status_code
        print(f"ERROR {status_code} de productos: {err.response.text}")
        if status_code == 401:
            return {"Valido": False, "error": "El microservicio de Productos rechazo la peticion"}
        if status_code == 403:
            return {"Valido": False, "error": "Sin permiso para acceder al producto"} 
        if status_code == 404:
            return {"Valido": False, "error": "El producto no existe"}
        return {"Valido": False, "error": f"El microservicio de Productos rechazo la peticion: {status_code}"} # Si es un starus 500

    except requests.exceptions.ConnectionError:
        # Error de red (El contenedor de Productos no esta corriendo)
        return {"Valido": False, "error": "El microservicio de Productos no esta corriendo"}
    
    except requests.exceptions.Timeout:
        # Error de tiempo de espera
        return {"Valido": False, "error": "El microservicio de Productos no responde"}
    
    except Exception as e:
        # Error desconocido
        return {"Valido": False, "error": f"Error desconocido: {str(e)}"}


# Metodo para verificar si existe el proveedor que estamos creando el lote
def verificar_proveedor(proveedor_id, user_headers):
    """
    Verifica que un proveedor existe en el microservicio de Proveedores.

    Args:
        proveedor_id (int): ID del proveedor a verificar.
        user_headers (dict): Headers con X-User-ID y X-User-Rol
                            extraídos del request original.

    Returns:
        dict: {"valido": True, "data": {...}} o {"valido": False, "error": "..."}
    """
    url = f"{PROVEEDOR_URL}/proveedores/{proveedor_id}/"

    try:
        existe_proveedor = requests.get(url, headers=user_headers, timeout=5)
        
        # Lanza una exceptcion si el status code es 400 o 500
        existe_proveedor.raise_for_status()

        return {"Valido": True, "data": existe_proveedor.json()}

    except requests.exceptions.HTTPError as err:
        
        status_code = err.response.status_code
        if status_code == 401:
            return {"Valido": False, "error": "El microservicio de Proveedor rechazo la peticion"}
        if status_code == 404:
            return {"Valido": False, "error": "El Proveedor no existe"}
        return {"Valido": False, "error": f"El microservicio de Proveedor rechazo la peticion: {status_code}"} # Si es un starus 500

    except requests.exceptions.ConnectionError:
        # Error de red (El contenedor de Proveedor no esta corriendo)
        return {"Valido": False, "error": "El microservicio de Proveedor no esta corriendo"}
    
    except requests.exceptions.Timeout:
        # Error de tiempo de espera
        return {"Valido": False, "error": "El microservicio de Proveedor no responde"}
    
    except Exception as e:
        # Error desconocido
        return {"Valido": False, "error": f"Error desconocido: {str(e)}"}

def actualizar_stock_producto(producto_id, cantidad_inicial_a_sumar, stock_actual, user_headers):
    """
    Actualiza el stock_actual de un producto en el microservicio de Productos.

    Calcula el nuevo stock sumando la cantidad del lote aprobado al stock
    actual del producto y envía un PATCH al servicio de Productos.

    Esta función se llama únicamente cuando un lote cambia de estado
    REVISION → APROBADO, nunca al crear el lote.

    Args:
        producto_id (int): ID del producto a actualizar.
        cantidad_a_sumar (Decimal): cantidad_inicial del lote aprobado.
        stock_actual (Decimal): stock_actual actual del producto
                                obtenido previamente del servicio de Productos.
        user_headers (dict): Headers con X-User-ID y X-User-Rol
                            extraídos del request original.

    Returns:
        dict: {"valido": True, "data": {...}} o {"valido": False, "error": "..."}
    """
    url = f"{PRODUCTO_URL}/productos/{producto_id}/actualizar-stock/"
    # Sumamos la cantidad que tragimos del servicio de productos
    # Junto con la cantidad inicial del lote
    nuevo_stock = float(stock_actual) + float(cantidad_inicial_a_sumar)
    try:
        response = requests.patch( # Peticion para actualizar de forma parcial
            url,
            json={"stock_actual": nuevo_stock}, # Enviamos el nuevo stock calculado al campo stock_actual de Producto
            headers=user_headers,
            timeout=5
        )
        response.raise_for_status()
        return {"Valido": True, "data": response.json()}

    except requests.exceptions.HTTPError as err:
        status_code = err.response.status_code
        return {"Valido": False, "error": f"Error al actualizar stock: {status_code}"}

    except requests.exceptions.ConnectionError:
        return {"Valido": False, "error": "El microservicio de Productos no está corriendo"}
    except requests.exceptions.Timeout:
        return {"Valido": False, "error": "El microservicio de Productos no responde"}
    except Exception as e:
        return {"Valido": False, "error": f"Error desconocido: {str(e)}"}


def decrementar_stock_producto(producto_id, cantidad_a_restar, stock_actual, user_headers):
    """
    Decrementa el stock_actual de un producto en el microservicio de Productos.

    Se usa cuando se registra una salida de inventario para restar
    la cantidad del stock del producto.

    Args:
        producto_id (int): ID del producto a actualizar.
        cantidad_a_restar (float): Cantidad a restar del stock.
        stock_actual (float): Stock actual del producto.
        user_headers (dict): Headers con X-User-ID y X-User-Rol.

    Returns:
        dict: {"valido": True, "data": {...}} o {"valido": False, "error": "..."}
    """
    url = f"{PRODUCTO_URL}/productos/{producto_id}/actualizar-stock/"
    
    nuevo_stock = float(stock_actual) - float(cantidad_a_restar)
    if nuevo_stock < 0:
        nuevo_stock = 0
    
    try:
        response = requests.patch(
            url,
            json={"stock_actual": nuevo_stock},
            headers=user_headers,
            timeout=5
        )
        response.raise_for_status()
        return {"Valido": True, "data": response.json()}

    except requests.exceptions.HTTPError as err:
        status_code = err.response.status_code
        return {"Valido": False, "error": f"Error al decrementar stock: {status_code}"}

    except requests.exceptions.ConnectionError:
        return {"Valido": False, "error": "El microservicio de Productos no está corriendo"}
    except requests.exceptions.Timeout:
        return {"Valido": False, "error": "El microservicio de Productos no responde"}
    except Exception as e:
        return {"Valido": False, "error": f"Error desconocido: {str(e)}"}