using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.WebRTC;
using WebSocketSharp;


public class CandidateData
{
  public string type;
  public string label;
  //public int id;
  public string candidate;
}

public class SDPData
{
  public string type;
  public string sdp;
}
[System.Serializable]
public class MyObject
{
  public float x;
  public float y;
}
public class MessageData
{
  public MyObject joystick1;
  public MyObject joystick2;
}


public class joyrtc : MonoBehaviour
{
  const string DefaultServer = "ws://localhost:8080/socket";
#pragma warning disable 0649
  [SerializeField] private Camera cam;
  [SerializeField] private GameObject cube;
  [SerializeField] private AudioSource audioSource;

#pragma warning restore 0649

  private bool enableCameraModeToggle = false;
  private bool connected;
  private bool whip = false;
	private WebSocket ws;
  private WhipClient whipClient;
	private RTCSessionDescription? sdp;
	private RTCPeerConnection _pc;
	private MediaStream videoStream;
  private MediaStream audioStream = new MediaStream();

  private static RTCConfiguration GetSelectedSdpSemantics()
  {
    RTCConfiguration config = default;
    var servers = new List<RTCIceServer>();
    string envIceServers = System.Environment.GetEnvironmentVariable("ICE_SERVERS");
    Debug.Log("Use WebRTC IceServers: " + envIceServers);
    if (!string.IsNullOrEmpty(envIceServers))
    {
      servers.Add(new RTCIceServer { urls = new[] { envIceServers } });
    }

    string envTurnHostname = System.Environment.GetEnvironmentVariable("TURN_HOSTNAME");
    Debug.Log("Use WebRTC Turn Server: " + envTurnHostname);
    if (!string.IsNullOrEmpty(envTurnHostname))
    {
      string envTurnUsername = System.Environment.GetEnvironmentVariable("TURN_USERNAME");
      string envTurnPassword = System.Environment.GetEnvironmentVariable("TURN_PASSWORD");
      servers.Add(new RTCIceServer {
        urls = new[] {envTurnHostname},
        username = envTurnUsername,
        credential = envTurnPassword,
      });
    }

    if (servers.Count > 0) {
      config.iceServers = servers.ToArray();
    }

    return config;
  }

  private IEnumerator OnCreateOffer(RTCPeerConnection pc, RTCSessionDescription desc)
  {
    var op = pc.SetRemoteDescription(ref desc);
    yield return op;
    if (op.IsError)
    {
      Debug.Log(op.Error);
      yield break;
    }
    yield return CreateAnswer(pc);
  }

  private IEnumerator CreateAnswer(RTCPeerConnection pc)
  {
    var op = pc.CreateAnswer();
    yield return op;
    if (!op.IsError)
    {
      yield return OnCreateAnswerSuccess(pc, op.Desc);
    }
    else
    {
      Debug.Log(op.Error);
      yield break;
    }
  }

  private IEnumerator OnCreateAnswerSuccess(RTCPeerConnection pc, RTCSessionDescription desc)
  {
    var op = pc.SetLocalDescription(ref desc);
    yield return op;

    if (!op.IsError)
    {
      SDPData obj = new SDPData()
      {
        type = "answer",
        sdp = desc.sdp,
      };
      ws.Send(JsonUtility.ToJson(obj));
    }
    else
    {
      Debug.Log(op.Error);
      yield break;
    }
  }

  private IEnumerator AsyncWebRTCCoroutine()
  {
    Debug.Log("=== WebRTC Start ===");
    connected = false;

    _pc.OnIceCandidate = candidate => {
      Debug.Log("ICE: " + candidate.Candidate);
      if (whip) return;

      // https://docs.unity3d.com/Packages/com.unity.webrtc@3.0/api/Unity.WebRTC.RTCIceCandidate.html#Unity_WebRTC_RTCIceCandidate_SdpMLineIndex
      //if (candidate.SdpMLineIndex.HasValue) {
      CandidateData obj = new CandidateData()
      {
        type = "ice",
        label = candidate.SdpMid,
        //id = candidate.SdpMLineIndex.Value,
        candidate = candidate.Candidate,
      };
      ws.Send(JsonUtility.ToJson(obj));
      //}
    };

    RTCDataChannelInit conf = new RTCDataChannelInit();
    conf.negotiated = true;
    conf.id = 0;
    var dataChannel = _pc.CreateDataChannel("data", conf);
    dataChannel.OnOpen = () => {

      // TODO: This has a weird problem
      // NOTE: Maybe this a bug for lib
      // Must onopen send a message from the Unity
      // dataChannel.Send("_");
      // === END ===

      Debug.Log("DataChannel Opened");
    };
    dataChannel.OnClose = () => {
      Debug.Log("DataChannel Closed");
    };

    dataChannel.OnMessage = bytes => {
      string message = System.Text.Encoding.UTF8.GetString(bytes);
      MessageData messageData = JsonUtility.FromJson<MessageData>(message);
      float joystick1X = messageData.joystick1.x;
      float joystick1Y = messageData.joystick1.y;
      float joystick2X = messageData.joystick2.x;
      float joystick2Y = messageData.joystick2.y;
      Debug.Log(message);

      // Switched modes after pressing the button in the frontend
      if (dataChannel != null && message == "{\"type\":\"camera_mode_toggle\"}")
      {
        enableCameraModeToggle = true;
      }
      // Applied x and y to object movement

      // Object rotation
      cube.transform.rotation *= Quaternion.Euler(0, joystick2X * 2f, 0);

      // Object movement
      Vector3 forwardVector = cube.transform.forward;
      Vector3 rightVector = cube.transform.right;
      Vector3 verticalMovement = cube.transform.up * joystick2Y * 0.1f;
      Vector3 horizontalMovement = (forwardVector * joystick1Y + rightVector * joystick1X) * 0.1f;
      cube.transform.position += verticalMovement + horizontalMovement;
    };

    _pc.OnIceConnectionChange = state => {
      Debug.Log($"IceConnectionState: {state}");
      if (state == RTCIceConnectionState.Disconnected)
      {
        connected = false;
      }
    };

    if (whip)
    {
      yield return 0;
    }

    RTCSessionDescription offer;
    while (sdp == null)
    {
      yield return 0;
    }
    offer = sdp.Value;
    sdp = null;
    connected = true;

    Debug.Log("=== Coroutine yield offer ===");
    yield return OnCreateOffer(_pc, offer);

    while (connected)
    {
      yield return 0;
    }
    yield return AsyncWebRTCCoroutine();
  }

  void Start()
  {
    Debug.Log("=== Start !! ===");
    string whipServerUrl = System.Environment.GetEnvironmentVariable("WHIP_SERVER_URL");
    whip = !string.IsNullOrEmpty(whipServerUrl);
    Debug.Log(cam);
    videoStream = cam.CaptureStream(1280, 720);
    audioSource = GetComponent<AudioSource>();

    StartCoroutine(WebRTC.Update());
    var configuration = GetSelectedSdpSemantics();
    _pc = new RTCPeerConnection(ref configuration);

    foreach (var track in videoStream.GetTracks())
    {
      Debug.Log("video track: " + track);
      _pc.AddTrack(track, videoStream);
    }
    foreach (var track in audioStream.GetTracks())
    {
      Debug.Log("audio track: " + track);
      _pc.AddTrack(track, audioStream);
    }
    StartCoroutine(AsyncWebRTCCoroutine());

    if (whip)
    {
      StartWHIP();
    }
    else
    {
      StartWebSocket();
    }

    Debug.Log("=== Start END ===");
  }

  void StartWebSocket() {
    string envServerUrl = System.Environment.GetEnvironmentVariable("SERVER_URL");
    string serverUrl = string.IsNullOrEmpty(envServerUrl) ? DefaultServer : envServerUrl;
    Debug.Log("=== StartWebSocket ===");
    Debug.Log("serverUrl: " + serverUrl);
    ws = new WebSocket(serverUrl);
    ws.OnMessage += (sender, e) => {
      Debug.Log("Received message: " + e.Data);
      RTCSessionDescription offer = JsonUtility.FromJson<RTCSessionDescription>(e.Data);
      if (offer.type == RTCSdpType.Offer)
      {
        sdp = offer;
        connected = false;
      }
      else
      {
        Debug.Log(offer.type);
        Debug.Log(offer.sdp);
      }
    };

    ws.Connect();
  }

  void StartWHIP() {
    Debug.Log("=== StartWHIP ===");
    string whipServerUrl = System.Environment.GetEnvironmentVariable("WHIP_SERVER_URL");
    Debug.Log("whipServerUrl: " + whipServerUrl);
    whipClient = new WhipClient(this);
    StartCoroutine(whipClient.Publish(_pc, whipServerUrl, ""));
  }

  void Update()
  {
    if (enableCameraModeToggle)
    {
      ThirdPersonCamera cameraScript = cam.GetComponent<ThirdPersonCamera>();
      cameraScript.ToggleModifyValues();
      enableCameraModeToggle = false;
    }
  }
}
