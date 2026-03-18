FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react ./
RUN npm run build

FROM nginx:1.27
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/frontend-react/dist /usr/share/nginx/html

EXPOSE 80
