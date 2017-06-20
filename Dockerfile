FROM thumbsupgallery/runtime:alpine
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "test"]
