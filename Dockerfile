FROM ghcr.io/thumbsup/build:node-18
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm test
