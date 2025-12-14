FROM node:20-slim

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN apt-get update -y && apt-get install -y openssl

RUN npm install


COPY . .

RUN npm run build

EXPOSE 5004

CMD ["npm", "start"]