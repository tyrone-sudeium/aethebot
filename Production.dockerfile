# Build stage. Adds all the gigantic dev dependencies in order to build.
FROM node:14.20.0-alpine
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

RUN yarn install \
    && yarn build -p tsconfig.prod.json

# Run stage. The smallest possible contents that can still run the app.
FROM node:14.20.0-alpine

WORKDIR /app

ARG COMMIT_SHA=""
ENV SOURCE_VERSION=${COMMIT_SHA}

# Add ffmpeg, runtime requirement for reddit/tiktok
# NOTE: Adds ~100MB :(
# RUN apk --no-cache add ffmpeg

# Copy the built .js files from the previous stage.
COPY --from=0 /app/dist /app/dist

# Add the bare minimum files required to bootstrap the app.
COPY public ./public
COPY res ./res
COPY package.json yarn.lock ./

RUN yarn install --production \
    && yarn cache clean

CMD ["yarn", "start"]
