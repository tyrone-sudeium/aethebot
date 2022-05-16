FROM node:14.15.4
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

# Apt dependencies to install and then uninstall
ARG BUILD_DEPS='make gcc g++ python'

# Layer for build (includes dev dependencies, yarn cache)
# Note: we need to keep the apt dependencies around for the next layer
# because yarn install --production requires it.
RUN apt-get update && apt-get install -y $BUILD_DEPS --no-install-recommends \
    && yarn install

# Layer for running (removes dev dependencies, adds dist)
RUN yarn run build \
    && rm -rf node_modules \
    && yarn install --production \
    && yarn cache clean \
    && apt-get purge -y --auto-remove $BUILD_DEPS

CMD ["yarn", "start"]
