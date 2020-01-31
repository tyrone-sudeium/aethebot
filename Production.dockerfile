FROM node:12.14.1
LABEL maintainer="tyrone@sudeium.com"

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

# Layer for build (includes dev dependencies, yarn cache)
RUN buildDeps='make gcc g++ python' \
    && apt-get update && apt-get install -y $buildDeps --no-install-recommends \
    && yarn install \
    && apt-get purge -y --auto-remove $buildDeps

# Layer for running (removes dev dependencies, adds dist)
RUN yarn run build \
    && rm -rf node_modules \
    && yarn install --production \
    && yarn cache clean

CMD ["yarn", "start"]
