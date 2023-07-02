import nipplejs from "nipplejs"

class JoyRtcComponent extends HTMLElement {
	private ws: WebSocket | null = null
	private pc: RTCPeerConnection | null = null
	private dc: RTCDataChannel | null = null

	private bar: HTMLDivElement
	private root: ShadowRoot

	private domWsState: HTMLParagraphElement
	private domPcState: HTMLParagraphElement
	private domDcState: HTMLParagraphElement


	constructor() {
		super()
		const template = document.createElement("template")
		//template.innerHTML = `<div>233333<video></video></div>`

		this.root = this.attachShadow({ mode: "closed" })
		this.bar = document.createElement("div")
		this.bar.style.display = "flex"
		this.bar.style.justifyContent = "space-evenly"
		this.root.appendChild(this.bar)

		this.domWsState = document.createElement("p")
		this.bar.appendChild(this.domWsState)

		this.domPcState = document.createElement("p")
		this.bar.appendChild(this.domPcState)

		this.domDcState = document.createElement("p")
		this.bar.appendChild(this.domDcState)

		this.websocketState = "uninit"
		this.webrtcState = "uninit"
		this.dataChannelState = "uninit"

		const button = document.createElement("button")
		button.onclick = () => {
			this.startWebsocket()
		}
		button.innerText = "start"

		this.bar.appendChild(button)

		const pad = document.createElement("div")
		pad.innerText = "555"
		const ipad = document.createElement("div")
		pad.appendChild(ipad)
		this.root.appendChild(pad)

		const instance = nipplejs.create({
			zone: ipad,
			mode: 'static',
			position: { top: '50%', left: '50%' },
			dynamicPage: true,
			restOpacity: 0.6,
			fadeTime: 200,
		})

		instance.on('move', (e, data) => {
			console.log(e, data)
			this.dc?.send(JSON.stringify(data.vector))
		})

		const content = template.content.cloneNode(true)
    this.root.appendChild(content)
	}

	set websocketState(state: string) {
		this.domWsState.innerText = `websocket: ${state}`
	}

	set webrtcState(state: string) {
		this.domPcState.innerText = `webrtc: ${state}`
	}

	set dataChannelState(state: string) {
		this.domDcState.innerText = `dataChannel: ${state}`
	}

	get debug(): boolean {
		return !!this.getAttribute("debug")
	}

	get autoplay(): boolean {
		return !!this.getAttribute("autoplay")
	}

	get address(): string {
		return this.getAttribute("address") || ""
	}

	set address(value: string) {
		this.setAttribute("address", value)
	}

	startWebsocket() {
		console.log("websocket start")
		this.ws = new WebSocket(this.address)
		this.ws.onopen = (ev) => {
			console.log("onopen", ev)
			this.websocketState = ev.type
			this.startWebRTC()
		}
		this.ws.onclose = ev => this.websocketState = ev.type
		this.ws.onerror = ev => this.websocketState = ev.type

		this.ws.onmessage = (ev) => {
			console.log("onmessage", ev.data)
			const sdp = JSON.parse(ev.data)
			console.log(sdp)
			if (sdp.type === "answer") {
				if (!this.pc) return
				this.pc.setRemoteDescription(sdp)
			}
		}
	}

	// TODO: webrtc start need iceServers config
	//async startWebRTC(config: RTCConfiguration) {
	async startWebRTC() {
		console.log(this.ws)
		if (!this.ws) return
		this.webrtcState = "init"
		const ws = this.ws
		//const pc = new RTCPeerConnection(config)
		const pc = new RTCPeerConnection()
		this.pc = pc

		this.dc = pc.createDataChannel("data", {
			negotiated: true,
			id: 0,
		})

		this.dc.onopen = ev => this.dataChannelState = ev.type
		this.dc.onclose = ev => this.dataChannelState = ev.type
		this.dc.onerror = ev => this.dataChannelState = ev.type
		this.dc.onmessage = ev => console.log(ev.data)

		pc.onicecandidate = (ev: RTCPeerConnectionIceEvent) => ev.candidate ? console.log(ev) : ws.send(JSON.stringify(pc.localDescription))
		pc.oniceconnectionstatechange = _ => this.webrtcState = pc.iceConnectionState
		pc.addTransceiver('video', {'direction': 'recvonly'})

		pc.ontrack = (event) => {
			var el = document.createElement(event.track.kind as "video")
			el.srcObject = event.streams[0]
			el.autoplay = true
			el.controls = true
			el.muted = true
			el.style.width = "inherit"
			el.style.height = "inherit"

			this.root.appendChild(el)
		}

		const offer =	await pc.createOffer()
		await pc.setLocalDescription(offer)
	}

	// WebComponents hook
	connectedCallback() {
		console.log('当自定义元素第一次被连接到文档DOM时被调用')
		console.log("autoplay: ", this.autoplay)
		console.log(navigator.getGamepads())
		if (this.autoplay) {
			console.log("autoplay")
			this.startWebsocket()
		}
	}

	// WebComponents hook
	disconnectedCallback() {
		console.log('当自定义元素与文档DOM断开连接时被调用')
	}

	// WebComponents hook
	adoptedCallback() {
		console.log('当自定义元素被移动到新文档时被调用')
	}

	// WebComponents hook
	attributeChangedCallback() {
		console.log('当自定义元素的一个属性被增加、移除或更改时被调用')
	}

}

customElements.define('joy-rtc', JoyRtcComponent)
export default JoyRtcComponent
