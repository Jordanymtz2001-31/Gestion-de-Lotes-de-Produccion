#Imagen base para python
#slim para redicir el tamaño de la imagen
FROM python:3.13-slim
#Evitamos que python genere archivos de configuracion que no necesitamos para esta ocacion
ENV PYTHONUNBUFFERED 1
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

#Instalamos las dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

#Copiamos el codigo de la aplicacion al contenedor
COPY . .

#Exponemos el puerto 8003 en el que corre la aplicacion
EXPOSE 8003

#Comando para iniciar la aplicacion
CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]