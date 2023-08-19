package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/bluenviron/gortsplib/v3"
	"github.com/bluenviron/gortsplib/v3/pkg/formats"
	"github.com/bluenviron/gortsplib/v3/pkg/media"
	"github.com/bluenviron/gortsplib/v3/pkg/url"
	"github.com/gorilla/websocket"
	"github.com/pion/rtcp"
	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3"
)

// WebRTC DataChannel
// - use hook exec script
// - socket jsonrpc, maybe lsp on socket

func main() {
	srcUrl := flag.String("src", "rtsp://localhost:8554/mystream", "rtsp url")
	server := flag.String("server", "ws://localhost:8080/socket", "server address")

	u, err := url.Parse(*srcUrl)
	if err != nil {
		panic(err)
	}

	c := gortsplib.Client{}
	err = c.Start(u.Scheme, u.Host)
	if err != nil {
		panic(err)
	}
	defer c.Close()

	// find published medias
	medias, baseURL, _, err := c.Describe(u)
	if err != nil {
		panic(err)
	}

	// setup all medias
	err = c.SetupAll(medias, baseURL)
	if err != nil {
		panic(err)
	}
	// called when a RTCP packet arrives
	c.OnPacketRTCPAny(func(medi *media.Media, pkt rtcp.Packet) {
		log.Printf("RTCP packet from media %v, type %T\n", medi, pkt)
	})

	// start playing
	_, err = c.Play(nil)
	if err != nil {
		panic(err)
	}

	ws, _, err := websocket.DefaultDialer.Dial(*server, nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	peerConnection, err := webrtc.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			//{
			//	URLs: []string{"stun:stun.l.google.com:19302"},
			//},
		},
	})
	if err != nil {
		panic(err)
	}

	negotiated := true
	//ordered := true
	dataChannelID := uint16(0)

	dc, err := peerConnection.CreateDataChannel("data", &webrtc.DataChannelInit{
		Negotiated: &negotiated,
		ID:         &dataChannelID,
	})
	if err != nil {
		panic(err)
	}

	dc.OnOpen(func() {
		fmt.Println("dataChannel Opened")
	})
	dc.OnMessage(func(msg webrtc.DataChannelMessage) {
		fmt.Printf("%s\n", msg.Data)
	})
	dc.OnClose(func() {
		fmt.Println("dataChannel Closed")
	})

	// Create a video track
	videoTrack, err := webrtc.NewTrackLocalStaticRTP(webrtc.RTPCodecCapability{MimeType: webrtc.MimeTypeVP8}, "video", "pion")
	if err != nil {
		panic(err)
	}
	rtpSender, err := peerConnection.AddTrack(videoTrack)
	if err != nil {
		panic(err)
	}

	// called when a RTP packet arrives
	c.OnPacketRTPAny(func(medi *media.Media, forma formats.Format, pkt *rtp.Packet) {
		videoTrack.WriteRTP(pkt)
	})

	// Read incoming RTCP packets
	// Before these packets are returned they are processed by interceptors. For things
	// like NACK this needs to be called.
	go func() {
		rtcpBuf := make([]byte, 1500)
		for {
			if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
				return
			}
		}
	}()

	// Set the handler for ICE connection state
	// This will notify you when the peer has connected/disconnected
	peerConnection.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		fmt.Printf("Connection State has changed %s \n", connectionState.String())

		if connectionState == webrtc.ICEConnectionStateFailed {
			if closeErr := peerConnection.Close(); closeErr != nil {
				panic(closeErr)
			}
		}
	})

	offer := webrtc.SessionDescription{}
	if err := ws.ReadJSON(&offer); err != nil {
		panic(err)
	}

	// Set the remote SessionDescription
	if err = peerConnection.SetRemoteDescription(offer); err != nil {
		panic(err)
	}

	// Create answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}

	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	// Sets the LocalDescription, and starts our UDP listeners
	if err = peerConnection.SetLocalDescription(answer); err != nil {
		panic(err)
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete

	if err := ws.WriteJSON(*peerConnection.LocalDescription()); err != nil {
		panic(err)
	}

	for {
		ice := webrtc.ICECandidate{}
		if err := ws.ReadJSON(&ice); err != nil {
			panic(err)
		}
		fmt.Println(ice)
	}

	// wait until a fatal error
	panic(c.Wait())
}
