import nipplejs from "nipplejs";
import { WHEPClient } from '@binbat/whip-whep/whep';

class JoyRtcComponent extends HTMLElement {
  private ws: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;

  private bar: HTMLDivElement;
  private root: ShadowRoot;

  private domWsState: HTMLSpanElement;
  private domPcState: HTMLSpanElement;
  private domDcState: HTMLSpanElement;
  private domGamepadState: HTMLSpanElement; // Added the variable domGamepadState

  private gamepadIndex: number | null = null;
  private gamepadAxesListener: ((event: GamepadEvent) => void) | null = null;

  constructor() {
    super();
    const template = document.createElement("template");

    this.root = this.attachShadow({ mode: "closed" });

    const buttonStart = document.createElement("button");
    buttonStart.onclick = () => {
      this.handlePlay();
    };
    buttonStart.textContent = "start";

    this.root.appendChild(buttonStart);

    this.bar = document.createElement("div");
    this.bar.style.display = "flex";
    this.bar.style.justifyContent = "space-evenly";
    this.bar.style.columnGap = "1em";
    this.root.appendChild(this.bar);

    this.domWsState = document.createElement("span");
    this.bar.appendChild(this.domWsState);

    this.domPcState = document.createElement("span");
    this.bar.appendChild(this.domPcState);

    this.domDcState = document.createElement("span");
    this.bar.appendChild(this.domDcState);

    this.domGamepadState = document.createElement("span"); // Added initialization for the domGamepadState variable
    this.bar.appendChild(this.domGamepadState); // Added the domGamepadState element

    this.websocketState = "uninit";
    this.webrtcState = "uninit";
    this.dataChannelState = "uninit";

    const buttonClick = document.createElement("button");
    buttonClick.textContent = "切换相机模式";
    buttonClick.addEventListener("click", () => {
      this.handleClick();
    });
    this.root.appendChild(buttonClick);

    // Created joystick containers
    // nipplejs reads `options.zone.parentElement` for position
    const zones = document.createElement("div");
    const zone1 = document.createElement("div");
    const zone2 = document.createElement("div");
    zones.appendChild(zone1);
    zones.appendChild(zone2);
    this.root.appendChild(zones);

    // Created the first joystick
    const instance1 = nipplejs.create({
      zone: zone1,
      color: 'black',
      mode: "static",
      position: {
        top: "50%",
        left: "25%",
      },
      dynamicPage: true,
      restOpacity: 0.6,
      fadeTime: 200,
    });
    instance1.on("move", (_, data) => {
      const message = { joystick1: { x: data.vector.x, y: data.vector.y } };
      this.dc?.send(JSON.stringify(message));
    });

    // Created the second joystick
    const instance2 = nipplejs.create({
      zone: zone2,
      color: 'black',
      mode: "static",
      position: {
        top: "50%",
        left: "75%",
      },
      dynamicPage: true,
      restOpacity: 0.6,
      fadeTime: 200,
    });
    instance2.on("move", (_, data) => {
      const message = { joystick2: { x: data.vector.x, y: data.vector.y } };
      this.dc?.send(JSON.stringify(message));
    });

    const content = template.content.cloneNode(true);
    this.root.appendChild(content);
  }

  set websocketState(state: string) {
    this.domWsState.innerText = `websocket: ${state}`;
  }

  set webrtcState(state: string) {
    this.domPcState.innerText = `webrtc: ${state}`;
  }

  set dataChannelState(state: string) {
    this.domDcState.innerText = `dataChannel: ${state}`;
  }

  get debug(): boolean {
    return !!this.getAttribute("debug");
  }

  get whep(): boolean {
    return !!this.getAttribute("whep");
  }

  get autoplay(): boolean {
    return !!this.getAttribute("autoplay");
  }

  get address(): string {
    return this.getAttribute("address") || "";
  }

  set address(value: string) {
    this.setAttribute("address", value);
  }

  startWebsocket() {
    console.log("websocket start");
    this.ws = new WebSocket(this.address);
    this.ws.onopen = (ev) => {
      console.log("onopen", ev);
      this.websocketState = ev.type;
      this.startWebRTC();
    };
    this.ws.onclose = (ev) => (this.websocketState = ev.type);
    this.ws.onerror = (ev) => (this.websocketState = ev.type);

    this.ws.onmessage = (ev) => {
      console.log("onmessage", ev.data);
      const sdp = JSON.parse(ev.data);
      console.log(sdp);
      if (sdp.type === "answer") {
        if (!this.pc) return;
        this.pc.setRemoteDescription(sdp);
      } else if (sdp.type === "ice") {
        this.pc?.addIceCandidate(new RTCIceCandidate({
          //sdpMLineIndex: sdp.id,
          sdpMid: sdp.label,
          candidate: sdp.candidate,
        }));
      }
    };
    this.startGamepadListening();
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.22333.fun"],
        },
        {
          urls: "turn:turn.22333.fun",
          username: "filegogo",
          credential: "filegogo",
        },
      ],
    });
    pc.ontrack = (event) => {
      if (event.track.kind === "audio") {
        // Processed the received audio track
        const audioElement = document.createElement("audio");
        audioElement.srcObject = event.streams[0];
        audioElement.autoplay = true;
        audioElement.muted = false;

        this.root.appendChild(audioElement);
      }
      else if (event.track.kind === "video") {
        // Processed the received video track
        const videoElement = document.createElement("video");
        videoElement.srcObject = event.streams[0];
        videoElement.autoplay = true;
        videoElement.muted = false;
        videoElement.style.overflow = "hidden";

        this.root.appendChild(videoElement);
      }
    };
    return pc;
  }

  async startWebRTC() {
    console.log(this.ws);
    if (!this.ws) return;
    this.webrtcState = "init";
    const ws = this.ws;
    const pc = this.createPeerConnection();
    this.pc = pc;

    this.dc = pc.createDataChannel("data", {
      negotiated: true,
      id: 0,
    });

    this.dc.onopen = (ev) => (this.dataChannelState = ev.type);
    this.dc.onclose = (ev) => (this.dataChannelState = ev.type);
    this.dc.onerror = (ev) => (this.dataChannelState = ev.type);
    this.dc.onmessage = (ev) => console.log(ev.data);

    pc.onicecandidate = (ev: RTCPeerConnectionIceEvent) =>
      ev.candidate ? console.log(ev) : ws.send(JSON.stringify(pc.localDescription));
    pc.oniceconnectionstatechange = (_) => (this.webrtcState = pc.iceConnectionState);
    pc.addTransceiver("video", { direction: "recvonly" });

    //// Added the audio track for receiving audio
    //pc.addTransceiver("audio", { direction: "recvonly" });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.startGamepadListening();
  }

  startWHEP() {
    const pc = this.createPeerConnection();
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
    const whep = new WHEPClient();
    whep.view(pc, this.address);
  }

  private startGamepadListening() {
    if (!this.gamepadIndex) {
      window.ongamepaddisconnected = (event) => {
        const gamepad = event.gamepad;
        this.gamepadIndex = gamepad.index;
        this.domGamepadState.innerHTML = `gamepad: connected`;

        this.gamepadAxesListener = () => {
          if (this.gamepadIndex) {
            const gamepad = navigator.getGamepads()[this.gamepadIndex];
            if (gamepad) {
              const axes = gamepad.axes;

              // Check the number of joysticks
              if (axes.length >= 4) {
                // Check if the joystick has stopped moving
                const joystick1 = { x: axes[0] || 0, y: -(axes[1] || 0) };
                const joystick2 = { x: axes[2] || 0, y: -(axes[3] || 0) };

                const message = { joystick1, joystick2 };
                this.dc?.send(JSON.stringify(message));
              }
            }
          }
        }

        window.addEventListener("gamepaddisconnected", this.gamepadAxesListener);

        window.requestAnimationFrame(this.checkGamepadAxes);
      }

      window.addEventListener("gamepaddisconnected", () => {
        this.gamepadIndex = null;
        this.domGamepadState.innerHTML = `gamepad: disconnected`;

        // Removed the stop listener
        window.removeEventListener("gamepaddisconnected", this.gamepadAxesListener!);
        this.gamepadAxesListener = null;
      });
    }
    window.requestAnimationFrame(this.checkGamepadAxes);
  }
  private checkGamepadAxes = () => {
    if (this.gamepadIndex !== null && this.gamepadAxesListener) {
      const gamepad = navigator.getGamepads()[this.gamepadIndex];
      if (gamepad) {
        this.gamepadAxesListener(new GamepadEvent("gamepaddisconnected", { gamepad }));
      }
    }

    window.requestAnimationFrame(this.checkGamepadAxes);
  }

  handleClick() {
    const message = { type: "camera_mode_toggle" };
    this.dc?.send(JSON.stringify(message));
  }

  private handlePlay() {
    if (this.whep) {
      this.startWHEP();
    } else {
      this.startWebsocket();
    }
  }

  // WebComponents hook
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks
  connectedCallback() {
    console.log("autoplay: ", this.autoplay);
    console.log(navigator.getGamepads());
    if (this.autoplay) {
      console.log("autoplay");
      this.handlePlay();
    }
  }
}

customElements.define("joy-rtc", JoyRtcComponent);

export default JoyRtcComponent;
