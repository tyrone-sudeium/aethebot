FROM node:14.15.4
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

ARG COMMIT_SHA=""
ENV SOURCE_VERSION=${COMMIT_SHA}

# Layer for build (includes dev dependencies, yarn cache)
RUN yarn install

# Layer for running (removes dev dependencies, adds dist)
RUN yarn run build \
    && rm -rf node_modules \
    && yarn install --production \
    && yarn cache clean

CMD ["yarn", "start"]
