FROM node:18

WORKDIR /usr/src/Test-technique

COPY package*.json ./

RUN npm install -g  

COPY . .

EXPOSE 3003

CMD ["nodemon", "index.js"]
