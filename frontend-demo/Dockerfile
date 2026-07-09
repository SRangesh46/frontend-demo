# some changes in docker for testing purpose 
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration production

FROM nginx:1.28-alpine

COPY --from=build /app/dist/MHL_DOS_CATALOGUE_FRONTEND /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
