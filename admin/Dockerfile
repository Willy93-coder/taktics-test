FROM node:14.21.3-bullseye

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 9000

CMD ["npm", "run", "start"]