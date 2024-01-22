# Build stage. Adds all the gigantic dev dependencies in order to build.
FROM node:18.14.2-alpine
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

ENV YARN_ENABLE_GLOBAL_CACHE="false"
ENV YARN_ENABLE_MIRROR="false"

RUN corepack enable \
    && yarn install --immutable \
    && yarn build -p tsconfig.prod.json

# Run stage. The smallest possible contents that can still run the app.
FROM node:18.14.2-alpine

WORKDIR /app

ARG COMMIT_SHA=""
ENV SOURCE_VERSION=${COMMIT_SHA}
ENV YARN_NODE_LINKER="node-modules"
ENV YARN_ENABLE_GLOBAL_CACHE="false"

# Add ffmpeg, runtime requirement for reddit/tiktok
# NOTE: Adds ~100MB :(
# RUN apk --no-cache add ffmpeg

# Copy the built .js and yarn detritus from the previous stage.
COPY --from=0 /app/dist /app/dist
COPY --from=0 /app/.yarn/releases ./.yarn/releases

# Add the bare minimum files required to bootstrap the app.
COPY public ./public
COPY res ./res
COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable \
    && yarn workspaces focus --production \
    && yarn cache clean \
    && rm -rf /root/.yarn

CMD ["yarn", "start"]
