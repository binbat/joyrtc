# JoyRTC

## Architecture

![joyrtc-arch](./joyrtc.png)

## Run

### Cloud

```bash
go run ./main.go -l 0.0.0.0:8080
```

### Unity

Unity Version: `2022.1.23f1`

NOTE: Don't use `unity.cn` !!! `unity.cn` version not compatible docker image!!!

Use Unity run

NOTE: Do not use safemode, The first run need auto install websocket-sharp

### Webui

```bash
npm install
npm run dev
```
