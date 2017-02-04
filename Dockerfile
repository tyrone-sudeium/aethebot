FROM mhart/alpine-node:6
MAINTAINER Tyrone Trevorrow <tyrone@sudeium.com>

ENV APPHOME /usr/src/aethebot
RUN mkdir -p $APPHOME
ADD . $APPHOME
WORKDIR $APPHOME
RUN npm install

CMD ["npm", "start"]
