FROM node:14.0-slim

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 9000

CMD ["npm", "run", "start"]