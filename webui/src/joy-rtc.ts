import nipplejs from "nipplejs";

class JoyRtcComponent extends HTMLElement {
	private ws: WebSocket | null = null;
	private pc: RTCPeerConnection | null = null;
	private dc: RTCDataChannel | null = null;

	private bar: HTMLDivElement;
	private root: ShadowRoot;

	private domWsState: HTMLParagraphElement;
	private domPcState: HTMLParagraphElement;
	private domDcState: HTMLParagraphElement;
	private domGamepadState: HTMLParagraphElement; // 添加了domGamepadState变量

	private gamepadIndex: number | null = null;
    private gamepadAxesListener: ((event: GamepadEvent) => void) | null = null;

	constructor() {
		super();
		const template = document.createElement("template");

		this.root = this.attachShadow({ mode: "closed" });
		this.bar = document.createElement("div");
		this.bar.style.display = "flex";
		this.bar.style.justifyContent = "space-evenly";
		this.root.appendChild(this.bar);

		this.domWsState = document.createElement("p");
		this.bar.appendChild(this.domWsState);

		this.domPcState = document.createElement("p");
		this.bar.appendChild(this.domPcState);

		this.domDcState = document.createElement("p");
		this.bar.appendChild(this.domDcState);

		this.domGamepadState = document.createElement("p"); // 添加了domGamepadState初始化
		this.bar.appendChild(this.domGamepadState); // 添加了domGamepadState元素

		this.websocketState = "uninit";
		this.webrtcState = "uninit";
		this.dataChannelState = "uninit";

		const buttonStart = document.createElement("button");
		buttonStart.onclick = () => {
			this.startWebsocket();
		};
		buttonStart.innerText = "start";

		this.bar.appendChild(buttonStart);

		const buttonClick = document.createElement("button");
		buttonClick.innerText = "切换相机模式";
		buttonClick.addEventListener("click", () => {
			this.handleClick();
		});
		this.root.appendChild(buttonClick);

		// 创建两个容器
		const pad1 = document.createElement("div");
		pad1.innerText = "摇杆1";
		const pad2 = document.createElement("div");
		pad2.innerText = "摇杆2";
		const ipad1 = document.createElement("div");
		const ipad2 = document.createElement("div");
		pad1.appendChild(ipad1);
		pad2.appendChild(ipad2);
		this.root.appendChild(pad1);
		this.root.appendChild(pad2);

		// 创建第一个摇杆
		const instance1 = nipplejs.create({
			zone: ipad1,
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

		// 创建第二个摇杆
		const instance2 = nipplejs.create({
			zone: ipad2,
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

	async startWebRTC() {
		console.log(this.ws);
		if (!this.ws) return;
		this.webrtcState = "init";
		const ws = this.ws;
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

    //// 添加接收音频的轨道
    //pc.addTransceiver("audio", { direction: "recvonly" });

		pc.ontrack = (event) => {
      if (event.track.kind === "audio")
      {
        // 处理接收到的音频轨道
        const audioElement = document.createElement("audio");
        audioElement.srcObject = event.streams[0];
        audioElement.autoplay = true;
        audioElement.controls = true;
        audioElement.muted = false;

        document.body.appendChild(audioElement);
      }
      else if (event.track.kind === "video")
      {
        // 处理接收到的视频轨道
        const videoElement = document.createElement("video");
        videoElement.srcObject = event.streams[0];
        videoElement.autoplay = true;
        videoElement.controls = true;
        videoElement.muted = false;

        document.body.appendChild(videoElement);
      }
		};

		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		this.startGamepadListening();
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

              // 判断摇杆数量
              if (axes.length >= 4) {
                // 检查摇杆是否停止移动
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

            // 移除停止监听器
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

  // WebComponents hook
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks
  connectedCallback() {
    console.log("autoplay: ", this.autoplay);
    console.log(navigator.getGamepads());
    if (this.autoplay) {
      console.log("autoplay");
      this.startWebsocket();
    }
  }
}

customElements.define("joy-rtc", JoyRtcComponent);
export default JoyRtcComponent;
