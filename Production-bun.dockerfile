FROM oven/bun:1.1.6-debian as bun

# Bun still sucks at building deps from src.
# Absolutely no idea why but a bun binary copied into a *node* image can build from src ok.
# We've entered brave new territory in cursed Just JS Things
FROM node:20.12.2-bookworm as builder

WORKDIR /app
# Rely on .dockerignore to remove irrelevant stuff
ADD . .

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

RUN bun install --frozen-lockfile --production &&\
    NODE_ENV=production bun build /app/src/index.ts /app/src/workers/vince.ts --outdir build --target bun --external "zlib-sync" --external "ffmpeg-static"

# The tiny image we want to use as an app runtime
FROM oven/bun:1.1.6-alpine

WORKDIR /home/bun/app

ARG COMMIT_SHA=""
ENV SOURCE_VERSION=${COMMIT_SHA}
ENV NODE_ENV=production

COPY --from=builder /app/build .
COPY public ./public
COPY res ./res

CMD [ "/usr/local/bin/bun", "run", "--no-install", "./index.js" ]
