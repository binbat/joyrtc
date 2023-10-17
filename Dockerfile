FROM node:20-alpine as builder-webui

WORKDIR /src

COPY webui/package.json webui/package-lock.json .
RUN npm install

COPY webui .

RUN npm run build

FROM golang:1.20-alpine AS builder-cloud

WORKDIR /src

COPY cloud/go.mod cloud/go.sum .
RUN go mod download

COPY cloud .

COPY --from=builder-webui /src/dist /src/dist

RUN go build -o joyrtc-cloud

FROM debian:bookworm

ADD https://gist.githubusercontent.com/a-wing/f7b074770b558e114911e339bb6a3e84/raw/de87e005cab863700ff69895e11bcef33325e893/multirun.sh /usr/bin/multirun.sh
RUN chmod +x /usr/bin/multirun.sh

COPY --from=builder-cloud /src/joyrtc-cloud /usr/bin/joyrtc-cloud
COPY build/StandaloneLinux64 /usr/lib/joyrtc-unity
RUN chmod +x /usr/lib/joyrtc-unity/joyrtc-unity

# Reference:
# NOTE: Unity3D can use `-nographics`
# But, WebRTC for Unity3D don't working in `-nographics`
# https://docs.unity3d.com/Manual/LogFiles.html
# https://github.com/Unity-Technologies/UnityRenderStreaming/blob/ba102703fdfe331a1026ea1a4f7aede99334896a/com.unity.renderstreaming/Documentation~/commandline-option.md?plain=1#L6

# So, For Linux, Unity3D current Only supports X11
# https://techoverflow.net/2019/02/23/how-to-run-x-server-using-xserver-xorg-video-dummy-driver-on-ubuntu/
# We need a X Server, But need OpenGL, We can use VirtualGL
# TigerVNC: Also developed with VirtualGL
# https://gist.github.com/rejunity/48859aa3e922bccbf0b97e382057df49
# https://wiki.archlinux.org/title/VirtualGL

# But, VirtualGL have some problems, I don't know how to solve this problem
# https://www.reddit.com/r/debian/comments/vpexd2/remote_xserver_on_headless_debian/
RUN apt update -y && apt install --no-install-recommends -y libx11-dev tigervnc-standalone-server x11-xserver-utils

EXPOSE 8080/tcp

# For China: please use `stun:cn.22333.fun`
ENV ICE_SERVERS="stun:stun.22333.fun"

# For China: please use `turn:cn.22333.fun`
ENV TURN_HOSTNAME="turn:turn.22333.fun"
ENV TURN_USERNAME="22333"
ENV TURN_PASSWORD="22333"

ENTRYPOINT ["multirun.sh", "/usr/bin/joyrtc-cloud", "tigervncserver -fg -SecurityTypes None -xstartup /usr/lib/joyrtc-unity/joyrtc-unity"]

