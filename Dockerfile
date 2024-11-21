FROM node:18

RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip python3-venv

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip3 install streamlink

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY twitchtrim/ ./

RUN npm run build

CMD ["npm", "start"]