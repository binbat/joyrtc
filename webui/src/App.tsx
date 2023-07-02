import React, { useRef, useState, DOMAttributes } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import JoyRtcComponent from './joy-rtc'
import './joy-rtc'

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['joy-rtc']: CustomElement<JoyRtcComponent>;
    }
  }
}

class HelloMessage extends React.Component {
  render() {
    return <div>Hello <joy-rtc id="aaa" address="ws://localhost:8080" autoplay ></joy-rtc>!</div>;
  }
}

function App() {
	const [count, setCount] = useState(0)
	const [address, setAddress] = useState("ws://localhost:8080")
	//const [websocketState, setWebsocketState] = useState("unused")
	//const wsConn = useRef<WebSocket | null>(null)
	//const peerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection)

	//const startWebsocket = (address: string) => {
	//	wsConn.current = new WebSocket(address)
	//	const ws = wsConn.current
	//	ws.onopen = (ev) => {
	//		setWebsocketState(JSON.stringify(ev))
	//	}
	//	ws.onclose = (ev) => {
	//		setWebsocketState(JSON.stringify(ev))
	//	}

	//	ws.onmessage = (ev) => {
	//		const sdp = JSON.parse(ev.data)
	//		console.log(sdp)
	//		if (sdp.type === "answer") {
	//			const pc = peerConnection.current
	//			pc.setRemoteDescription(sdp)
	//		}
	//	}
	//}

	//const startWebRTC = async (ws: WebSocket) => {
	//	const pc = peerConnection.current
	//	//const pc.current = new RTCPeerConnection()
	//	pc.onicecandidate = (ev: RTCPeerConnectionIceEvent) => ev.candidate ? console.log(ev) : ws.send(JSON.stringify(pc.localDescription))
	//	pc.oniceconnectionstatechange = _ => console.log(pc.iceConnectionState)
	//	pc.addTransceiver('video', {'direction': 'recvonly'})

	//	pc.ontrack = function (event) {
	//		var el = document.createElement(event.track.kind)
	//		//@ts-ignore
	//		el.srcObject = event.streams[0]
	//		//@ts-ignore
	//		el.autoplay = true
	//		//@ts-ignore
	//		el.controls = true

	//		//@ts-ignore
	//		document.getElementById('remoteVideos').appendChild(el)
	//	}

	//	const offer =	await pc.createOffer()
	//	await pc.setLocalDescription(offer)

	//	//ws.send(JSON.stringify(pc.localDescription))
	//}

	//		<div>WebSocket State: { websocketState }</div>
	//			<input type="text" value={ address } onChange={ e => setAddress(e.target.value) } />
	//			<button onClick={ () => startWebsocket(address) }>Start Websocket</button>
	//
	//
	//			<button onClick={ () => wsConn.current && startWebRTC(wsConn.current) }>Start WebRTC</button>
	//
	//			<div id="remoteVideos"></div> <br />

	// <HelloMessage/>

  return (
		<>
			<joy-rtc address="ws://localhost:8080" style={{ width: "1024px" }} ></joy-rtc>
	      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
