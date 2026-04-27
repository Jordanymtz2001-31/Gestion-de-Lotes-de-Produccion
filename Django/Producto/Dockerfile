#ETAPA DE CONSTRUCCION
#Imagen base para python
#slim para redicir el tamaño de la imagen
FROM python:3.13-slim AS builder
#Evitamos que python genere archivos de configuracion que no necesitamos para esta ocacion
ENV PYTHONUNBUFFERED=1

#Evita que Python escriba archivos .pyc en el disco, ahorrando un poco más de espacio y manteniendo limpia la imagen
ENV PYTHONDONTWRITEBYTECODE=1

#Creamos una carpeta dentro del contenedor para alojar la aplicacion
WORKDIR /app

#Instalamos las dependencias del proyecto
#Linea 1  Actualizamos los repositorios e instalamos las librerias con permisos a todo (-y)
#Linea 2  default-libmysqlclient-dev: Libreria cliente de mysql
#Linea 3  build-essential: Herramientas de compilacion de c/c++
#Linea 4  pkg-config: Herramienta para gestionar librerias de desarrollo de python
#Linea 5  Limpiamos la cache de apt-get para reducir el tamaño de la imagen
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

#Copiamos el archivo requirements.txt al contenedor
COPY requirements.txt .

#Evitar que pip guarde una copia de los paquetes instalados dentro del contenedor.
#El --prefix=/install es para almacenar los paquetes en la carpeta /install ya que el /root/.local es carpeta privada, almenos que sea por seguridad se coloca
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

#---ETAPA DE EJECUCION---
FROM python:3.13-slim

#Creamos una carpeta dentro del contenedor para alojar la aplicacion
WORKDIR /app

# IMPORTANTE: La imagen final TAMBIÉN necesita esto para ejecutar el driver
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

#Copiamos los archivos de la etapa de construccion al contenedor
COPY --from=builder /install /usr/local

#Copiamos el codigo de la aplicacion al contenedor
COPY . .

#Evitamos que python genere archivos de configuracion que no necesitamos para esta ocacion
ENV PYTHONUNBUFFERED=1

#Exponemos el puerto 8001 en el que corre la aplicacion
EXPOSE 8001

#Comando para iniciar la aplicacion
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "Producto.wsgi.application"]
# Forma local CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]