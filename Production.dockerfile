FROM node:14.20.0-alpine
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

ARG COMMIT_SHA=""
ENV SOURCE_VERSION=${COMMIT_SHA}

# Add ffmpeg, runtime requirement for reddit/tiktok
# NOTE: Adds ~100MB :(
# RUN apk --no-cache add ffmpeg

# Layer for build (includes dev dependencies, yarn cache)
RUN yarn install

# Layer for running (removes dev dependencies, adds dist)
RUN yarn run build \
    && rm -rf node_modules \
    && yarn install --production \
    && yarn cache clean

CMD ["yarn", "start"]
