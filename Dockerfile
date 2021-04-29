FROM node:14-alpine as build

WORKDIR /code
COPY . .
RUN npm ci && npm run build

FROM node:14-alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=production
COPY --from=build /code/dist/ .

CMD ["node", "/app/index.js"]
