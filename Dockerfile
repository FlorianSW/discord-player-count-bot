# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /usr/src/build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production/Runtime
FROM node:24-alpine AS production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/build/dist ./dist
CMD ["node", "/usr/src/app/index.js"]
