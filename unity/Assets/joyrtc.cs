using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.WebRTC;
using WebSocketSharp;

public class SDPData {
	public string type;
	public string sdp;
}
[System.Serializable]
public class MyObject
{
    public float x;
    public float y;
}

public class joyrtc : MonoBehaviour {
#pragma warning disable 0649
	[SerializeField] private Camera cam;
    [SerializeField] private GameObject cube; // 添加一个立方体游戏对象
#pragma warning restore 0649

    private bool connected;
	private WebSocket ws;
	private RTCSessionDescription? sdp;
	private RTCPeerConnection _pc;
	private MediaStream videoStream;
	private List<RTCRtpSender> pcSenders;

	private static RTCConfiguration GetSelectedSdpSemantics() {
		RTCConfiguration config = default;
		// TODO: need config from the cloud
		// config.iceServers = new[] {new RTCIceServer {urls = new[] {"stun:stun.l.google.com:19302"}}};
		return config;
	}

	private void AddTracks() {
		foreach (var track in videoStream.GetTracks()) {
			Debug.Log("track: " + track);
			pcSenders.Add(_pc.AddTrack(track, videoStream));
		}
	}

	private IEnumerator OnCreateOffer(RTCPeerConnection pc, RTCSessionDescription desc) {
		var op = pc.SetRemoteDescription(ref desc);
		yield return op;
		if (op.IsError) {
			Debug.Log(op.Error);
			yield break;
		}
		yield return CreateAnswer(pc);
	}

	private IEnumerator CreateAnswer(RTCPeerConnection pc) {
		var op = pc.CreateAnswer();
		yield return op;
		if (!op.IsError) {
			yield return OnCreateAnswerSuccess(pc, op.Desc);
		} else {
			Debug.Log(op.Error);
			yield break;
		}
	}

	private IEnumerator OnCreateAnswerSuccess(RTCPeerConnection pc, RTCSessionDescription desc) {
		var op = pc.SetLocalDescription(ref desc);
		yield return op;

		if (!op.IsError) {
			SDPData obj = new SDPData() {
				type = "answer",
				sdp = desc.sdp,
			};
			ws.Send(JsonUtility.ToJson(obj));
		} else {
			Debug.Log(op.Error);
			yield break;
		}
	}

	private IEnumerator AsyncWebRTCCoroutine() {
		Debug.Log("=== WebRTC Start ===");
		connected = false;
		var configuration = GetSelectedSdpSemantics();
		_pc = new RTCPeerConnection(ref configuration);

		RTCDataChannelInit conf = new RTCDataChannelInit();
		conf.negotiated = true;
		conf.id = 0;
    var dataChannel = _pc.CreateDataChannel("data", conf);
		dataChannel.OnOpen = () => {

			// TODO: This has a weird problem
			// NOTE: Maybe this a bug for lib
			// Must onopen send a message from the Unity
			dataChannel.Send("_");
			// === END ===

			Debug.Log("DataChannel Opened");
		};
		dataChannel.OnClose = () => {
			Debug.Log("DataChannel Closed");
		};


        dataChannel.OnMessage = bytes => {
            string message = System.Text.Encoding.UTF8.GetString(bytes);
            MyObject myObject = JsonUtility.FromJson<MyObject>(message);

            // 将x和y应用到物体的移动
            cube.transform.position += new Vector3(myObject.x * 0.05f, myObject.y * 0.05f, 0);
        };



        _pc.OnIceConnectionChange = state => {
			Debug.Log($"IceConnectionState: {state}");
			if (state == RTCIceConnectionState.Disconnected) {
				connected = false;
			}
		};

		foreach (var track in videoStream.GetTracks()) {
			Debug.Log("track: " + track);
			_pc.AddTrack(track, videoStream);
		}

		RTCSessionDescription offer;
		while (sdp == null) {
			yield return 0;
		}
		offer = sdp.Value;
		sdp = null;
		connected = true;

		Debug.Log("=== Coroutine yield offer ===");
		yield return OnCreateOffer(_pc, offer);

		while (connected) {
			yield return 0;
		}
		yield return AsyncWebRTCCoroutine();
	}

	void Start() {
		Debug.Log("=== Start !! ===");
		Debug.Log(cam);
		if (videoStream == null) {
			videoStream = cam.CaptureStream(1280, 720);
		}
		StartCoroutine(WebRTC.Update());
		StartCoroutine(AsyncWebRTCCoroutine());

		// TODO: this address need from "ENV"
		ws = new WebSocket ("ws://127.0.0.1:8080");
		ws.OnMessage += (sender, e) => {
			Debug.Log("Received message: " + e.Data);
			RTCSessionDescription offer = JsonUtility.FromJson<RTCSessionDescription>(e.Data);
			if (offer.type == RTCSdpType.Offer) {
				sdp = offer;
				connected = false;
			} else {
				Debug.Log(offer.type);
				Debug.Log(offer.sdp);
			}
		};

		ws.Connect();
		Debug.Log("=== Start END ===");
	}

	void Update() {}
}
