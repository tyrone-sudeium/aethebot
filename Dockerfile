FROM mhart/alpine-node:6
MAINTAINER Tyrone Trevorrow <tyrone@sudeium.com>

ENV APPHOME /usr/src/aethebot
RUN mkdir -p $APPHOME
ADD . $APPHOME
WORKDIR $APPHOME

RUN apk add --no-cache --virtual .builddeps make gcc g++ python \
    && npm install \
    && apk del .builddeps

CMD ["npm", "start"]
