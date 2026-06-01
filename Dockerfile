# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Servidor Nginx)
FROM nginx:alpine
# Copiamos los archivos compilados desde la etapa anterior a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Si usas Create React App en lugar de Vite, cambia /app/dist por /app/build

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]