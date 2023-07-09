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
		instance1.on("move", (e, data) => {
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
		instance2.on("move", (e, data) => {
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
			}
		};
	}

	async startWebRTC() {
		console.log(this.ws);
		if (!this.ws) return;
		this.webrtcState = "init";
		const ws = this.ws;
		const pc = new RTCPeerConnection();
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

		pc.ontrack = (event) => {
			var el = document.createElement(event.track.kind as "video");
			el.srcObject = event.streams[0];
			el.autoplay = true;
			el.controls = true;
			el.muted = true;
			el.style.width = "inherit";
			el.style.height = "inherit";

			this.root.appendChild(el);
		};

		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
	}

	handleClick() {
	const message = { type: "camera_mode_toggle" };
	 this.dc?.send(JSON.stringify(message));
	}
	// WebComponents hook
	connectedCallback() {
		console.log("当自定义元素第一次被连接到文档DOM时被调用");
		console.log("autoplay: ", this.autoplay);
		console.log(navigator.getGamepads());
		if (this.autoplay) {
			console.log("autoplay");
			this.startWebsocket();
		}
	}

	// WebComponents hook
	disconnectedCallback() {
		console.log("当自定义元素与文档DOM断开连接时被调用");
	}

	// WebComponents hook
	adoptedCallback() {
		console.log("当自定义元素被移动到新文档时被调用");
	}

	// WebComponents hook
	attributeChangedCallback() {
		console.log("当自定义元素的一个属性被增加、移除或更改时被调用");
	}
}

customElements.define("joy-rtc", JoyRtcComponent);
export default JoyRtcComponent;
