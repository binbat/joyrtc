using UnityEngine;
using WebSocketSharp;

public class CanvasTextSender : MonoBehaviour
{
  private WebSocket ws;

  private void Start()
  {
    ws = new WebSocket("ws://your_websocket_server_address");
    ws.OnOpen += OnWebSocketOpen;
    ws.OnClose += OnWebSocketClose;
    ws.OnError += OnWebSocketError;
    ws.Connect();
  }

  private void OnWebSocketOpen(object sender, System.EventArgs e)
  {
    Debug.Log("WebSocket connected");
    // 在WebSocket连接建立后发送Canvas文本数据
    SendCanvasTextData("Hello, world!");
  }

  private void OnWebSocketClose(object sender, WebSocketSharp.CloseEventArgs e)
  {
    Debug.Log("WebSocket closed");
  }

  private void OnWebSocketError(object sender, WebSocketSharp.ErrorEventArgs e)
  {
    Debug.Log("WebSocket error: " + e.Message);
  }

  private void SendCanvasTextData(string text)
  {
    // 构造要发送的消息对象
    var message = new { type = "text", text };

    // 将消息对象转换为JSON字符串
    var json = JsonUtility.ToJson(message);

    // 发送JSON字符串到WebSocket服务器
    ws.Send(json);
  }

  private void OnApplicationQuit()
  {
    // 关闭WebSocket连接
    if (ws != null && ws.IsAlive)
    {
      ws.Close();
    }
  }
}
