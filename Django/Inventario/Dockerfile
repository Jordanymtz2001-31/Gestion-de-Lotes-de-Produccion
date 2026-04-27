#--ETAPA DE CONSTRUCCION--

#Imagen base para python
#slim para redicir el tamaño de la imagen
FROM python:3.13-slim AS builder

#Evita que Python escriba archivos .pyc en el disco, ahorrando un poco más de espacio y manteniendo limpia la imagen
ENV PYTHONDONTWRITEBYTECODE=1

#Evitamos que python genere archivos de configuracion que no necesitamos para esta ocacion
ENV PYTHONUNBUFFERED=1

#Creamos una carpeta dentro del contenedor para alojar la aplicacion
WORKDIR /app

#Copiamos el archivo requirements.txt al contenedor
COPY requirements.txt .

#Evitar que pip guarde una copia de los paquetes instalados dentro del contenedor.
#El --prefix=/install es para almacenar los paquetes en la carpeta /install ya que el /root/.local es carpeta privada, almenos que sea por seguridad se coloca
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

#--ETAPA DE EJECUCION--
FROM python:3.13-slim

#Creamos una carpeta dentro del contenedor para alojar la aplicacion
WORKDIR /app

#Copiamos los archivos de la etapa de construccion al contenedor
COPY --from=builder /install /usr/local

#Copiamos eL codigo de la aplicacion al contenedor
COPY . .

#Exponemos el puerto 8003 en el que corre la aplicacion
EXPOSE 8003

# Ejecutamos migraciones antes de arrancar para asegurar que la DB exista
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8003 Inventario.wsgi.application"]

#Comando para iniciar la aplicacion
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]