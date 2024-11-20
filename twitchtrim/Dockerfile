FROM node:18

RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    pip3 install streamlink

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]