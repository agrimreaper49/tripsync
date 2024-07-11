# Stage 1: Build the Angular application
FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=build /usr/src/app/dist/ /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]