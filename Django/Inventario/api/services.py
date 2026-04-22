import requests
from rest_framework import status
from rest_framework.response import Response

PRODUCTO_URL = "http://producto_app:8001"
PROVEEDOR_URL = "http://proveedor_app:8002"

# Metodo para verificar si existe el producto que estamos creando el lote
def verificar_producto(producto_id, user_headers):
    """
    Llamamos al servicio de productos para verificar que existe
    user_headers para pasar el X-User-ID y X-User-Rol para que el middleware
    del servicio destino no rechace la peticion
    """
    url = f"{PRODUCTO_URL}/productos/{producto_id}/"

    try:
        existe_producto = requests.get(url, headers=user_headers, timeout=5)
        
        # Lanza una exceptcion si el status code es 400 o 500
        existe_producto.raise_for_status()
        # Devolvos el producto en caso de que exista
        return {"Valido": True, "data": existe_producto.json()}

    except requests.exceptions.HTTPError as err:
        
        status_code = err.response.status_code
        if status_code == 401:
            return {"Valido": False, "error": "El microservicio de Productos rechazo la peticion"}
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
    Llamamos al servicio de productos para verificar que existe
    user_headers para pasar el X-User-ID y X-User-Rol para que el middleware
    del servicio destino no rechace la peticion
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
    url = f"{PRODUCTO_URL}/productos/{producto_id}/"
    # Sumamos la cantidad que tragimos del servicio de productos
    # Junto con la cantidad inicial del lote
    nuevo_stock = stock_actual + cantidad_inicial_a_sumar
    try:
        response = requests.patch( # Peticion para actualizar de forma parcial
            url,
            json={"stock_actual": nuevo_stock}, # Enviamos el nuevo stock calculado al campo stock_actual de Producto
            headers=user_headers,
            timeout=5
        )
        response.raise_for_status()
        return {"valido": True, "data": response.json()}

    except requests.exceptions.HTTPError as err:
        status_code = err.response.status_code
        return {"valido": False, "error": f"Error al actualizar stock: {status_code}"}

    except requests.exceptions.ConnectionError:
        return {"valido": False, "error": "El microservicio de Productos no está corriendo"}
    except requests.exceptions.Timeout:
        return {"valido": False, "error": "El microservicio de Productos no responde"}
    except Exception as e:
        return {"valido": False, "error": f"Error desconocido: {str(e)}"}
    """
    try:
        existe_producto = requests.get(
            f"http://localhost:8001/api/productos/{producto_id}/", 
            headers=user_headers, # Pasamos los headers para que el middleware no rechace la peticion
            timeout=5 # Tiempo de espera de la peticion
        )
        #Recuperamos y almacenamos los cuerpos de las peticiones en formato JSON
        productos = existe_producto.json()


    
        if existe_producto.status_code == 200:
            return existe_producto.json()  # devuelve los datos del producto
        return None
    except requests.exceptions.RequestException:
        return None  # si el servicio no responde, devuelve None
    """
    """
        if existe_producto.status_code == 200: # Si la peticion fue exitosa
            return existe_producto.json() # Retornamos el json de la peticion
        else:
            error_detail = {
                "Error" : "Error al obtener el producto",
                "Detalle" : {existe_producto.status_code}
            }
            return Response(error_detail, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except requests.exceptions.RequestException as e:
        return Response({'error': f'Error de conexión con el servicio', 'detalle': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    """