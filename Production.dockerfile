# A smaller, production-only Dockerfile
FROM mhart/alpine-node:8.9.4
LABEL maintainer="tyrone@sudeium.com"
WORKDIR /app
COPY . ./
RUN apk add --no-cache --virtual .builddeps make gcc g++ python \
    && yarn install && yarn tsc \
    && cd node_modules/ffmpeg-binaries/bin \
    && rm -rf *.exe ffmpeg-10bit ffprobe ffserver

# Only copy over the node pieces we need from the above image
FROM alpine:3.6
COPY --from=0 /usr/bin/node /usr/bin/
COPY --from=0 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
WORKDIR /app
RUN mkdir -p dist node_modules public res views
COPY --from=0 /app/dist ./dist/
COPY --from=0 /app/node_modules ./node_modules/
COPY --from=0 /app/public ./public/
COPY --from=0 /app/res ./res/
COPY --from=0 /app/views ./views/
COPY --from=0 /app/package.json ./

CMD ["node", "dist/index.js"]
