FROM node:22.23.1-alpine3.23
LABEL maintainer="tyrone@sudeium.com"

# Add ffmpeg, runtime requirement for reddit/tiktok
# RUN apk --no-cache add ffmpeg

WORKDIR /app
ADD . .
