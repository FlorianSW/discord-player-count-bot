FROM node:16-alpine as build

WORKDIR /code
RUN apk add --no-cache git
COPY . .
RUN npm ci && npm run build

FROM node:16-alpine

WORKDIR /app
RUN apk add --no-cache --virtual build-dependencies git
COPY package.json .
RUN npm install --only=production
RUN apk del build-dependencies
COPY --from=build /code/dist/ .

CMD ["node", "/app/index.js"]
