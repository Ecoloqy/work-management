# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Instalacja dodatkowych zależności
RUN apk add --no-cache python3 make g++

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./
COPY tsconfig.json ./
COPY config-overrides.js ./

# Instalacja zależności
RUN npm install

# Kopiowanie kodu źródłowego
COPY . .

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=4096

# Budowanie aplikacji
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 