# A simpler, less image-size conscious, more dev-friendly Dockerfile
FROM mhart/alpine-node:8.9.4
MAINTAINER Tyrone Trevorrow <tyrone@sudeium.com>

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

RUN apk add --no-cache --virtual .builddeps make gcc g++ python \
    && npm install \
    && apk del .builddeps

CMD ["npm", "start"]
