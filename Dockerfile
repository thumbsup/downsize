ARG NODE_VERSION=18
FROM ghcr.io/thumbsup/build:node-$NODE_VERSION
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm test
