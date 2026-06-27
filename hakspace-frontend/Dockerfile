FROM node:20-alpine AS build
WORKDIR /app

# Copy only package.json — intentionally NOT copying package-lock.json
# so npm does a fresh install that always includes devDependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Run vite directly from node_modules/.bin to bypass any PATH issues
RUN ./node_modules/.bin/vite build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]