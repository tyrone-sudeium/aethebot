FROM node:8.9.4
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

RUN buildDeps='make gcc g++ python' \
    && apt-get update && apt-get install -y $buildDeps --no-install-recommends \
    && yarn install --production=true \
    && apt-get purge -y --auto-remove $buildDeps \
    && cd node_modules/ffmpeg-binaries/bin \
    && rm -rf *.exe ffmpeg-10bit ffprobe ffserver

CMD ["yarn", "start"]
