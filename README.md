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

**Maybe manual install `websocket-sharp`**

```bash
pushd unity/Assets && nuget install && popd
```

Environment variables

Variable Name  | Description                                              | Default
-------------- | -------------------------------------------------------- | -------------------------------------------------------------
`ICE_SERVERS`  | Stun Server Configuration                                |
`TURN_HOSTNAME`| Turn Server Address Configuration                        |
`TURN_USERNAME`| Turn Server Username, Need set `TURN_HOSTNAME`           |
`TURN_PASSWORD`| Turn Server Password, Need set `TURN_HOSTNAME`           |
`SERVER_URL`   | WebSocket Signal Address                                 | `ws://127.0.0.1:8080`

### WebUI

```bash
npm install
npm run dev
```
