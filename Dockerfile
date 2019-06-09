FROM thumbsupgallery/runtime:alpine

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm test
