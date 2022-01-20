FROM node:15-alpine
WORKDIR /usr/src/app
RUN apk add yarn vim
COPY . /usr/src/app
RUN yarn install --production
EXPOSE 3000
