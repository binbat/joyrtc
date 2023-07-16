#FROM node:20-alpine as builder-webui
#
#WORKDIR /src
#
#COPY webui/package.json webui/package-lock.json .
#RUN npm install
#
#COPY webui .
#
#RUN npm run build

FROM golang:1.20-alpine AS builder-cloud

WORKDIR /src

COPY cloud/go.mod cloud/go.sum .
RUN go mod download

COPY cloud .

#COPY --from=builder-webui /src/build /src/build

RUN go build -o joyrtc-cloud

# Bin
FROM alpine AS bin
RUN apk add --no-cache bash

ADD https://gist.githubusercontent.com/a-wing/f7b074770b558e114911e339bb6a3e84/raw/de87e005cab863700ff69895e11bcef33325e893/multirun.sh /usr/bin/multirun.sh
RUN chmod +x /usr/bin/multirun.sh

COPY --from=builder-cloud /src/joyrtc-cloud /usr/bin/joyrtc-cloud
COPY build/StandaloneLinux64 /usr/lib/joyrtc-unity
RUN chmod +x /usr/lib/joyrtc-unity/joyrtc-unity

EXPOSE 8080/tcp

ENTRYPOINT ["multirun.sh", "/usr/bin/joyrtc-cloud", "/usr/lib/joyrtc-unity/joyrtc-unity"]

