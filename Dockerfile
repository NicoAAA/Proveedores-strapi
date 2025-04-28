# 1) Imagen base: Node 18 LTS en Alpine (ligera y compatible con tu rango Engines)
FROM node:18-alpine

# 2) Paquetes necesarios para compilar pg y otras dependencias nativas
RUN apk add --no-cache python3 make g++

# 3) Directorio de trabajo
WORKDIR /app

# 4) Copia sólo package*.json para cachear instalación
COPY package*.json ./

# 5) Instala dependencias
RUN npm install

# 6) Copia el resto de tu código
COPY . .

# 7) Construye Strapi (genera admin UI optimizado)
RUN npm run build

# 8) Exponer puerto Strapi
EXPOSE 1337

# 9) Arranque por defecto (producción)
CMD ["npm", "start"]


