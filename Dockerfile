FROM node:14.20.0-alpine
LABEL maintainer="tyrone@sudeium.com"

# Add ffmpeg, runtime requirement for reddit/tiktok
# RUN apk --no-cache add ffmpeg

WORKDIR /app
ADD . .
