FROM node:alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY ./package.json .
RUN yarn -s

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]
