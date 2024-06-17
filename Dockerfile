FROM ghcr.io/puppeteer/puppeteer:22.10.0

USER root

# Crear el directorio si no existe y ajustar permisos
RUN mkdir -p /var/lib/apt/lists/partial && \
    chmod 777 /var/lib/apt/lists/partial

# Instalar dbus, OpenSSL y generar machine-id
RUN apt-get update && \
    apt-get install -y dbus openssl && \
    dbus-uuidgen > /etc/machine-id

COPY .env .env

RUN export $(cat .env | xargs)

EXPOSE 8080    

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm ci
COPY . . 



RUN ls -la /usr/src/app
CMD [ "node", "src/index.js" ]