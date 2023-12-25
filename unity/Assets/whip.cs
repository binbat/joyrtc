using System;
using System.Collections;
using System.Collections.Generic;
using Unity.WebRTC;
using UnityEngine;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text.RegularExpressions;
using UnityEngine.Networking;
using System.Text;
using System.Linq;

//public class CandidateData
//{
//  public string type;
//  public string label;
  //public int id;
//  public string candidate;
//}
public class WhipClient
{
  private MonoBehaviour mb { get; set; }
  public string ICE_Username { get; set; }
  public string ICE_Password { get; set; }
  public List<RTCIceCandidate> candidates;
  public bool endOfCandidates { get; set; }
  public RTCPeerConnection pc;
  public string token;
  private string resourceURL;
  private bool restartIce;
  private string etag;

  private class Media
  {
    public string Mid { get; set; }
    public TrackKind Kind { get; set; }
    public List<RTCIceCandidate> Candidates { get; set; }
  }

  public WhipClient(MonoBehaviour mb)
  {
    this.mb = mb;
    //Ice properties
    this.ICE_Username = null;
    this.ICE_Password = null;
    //Pending candidadtes
    this.candidates = new List<RTCIceCandidate>();
    this.endOfCandidates = false;
  }

  public IEnumerator Publish(RTCPeerConnection pc, string url, string token)
  {
    // If already publishing
    if (this.pc != null)
      throw new InvalidOperationException("Already publishing");

    // Store pc object and token
    this.token = token;
    this.pc = pc;

    // Listen for state change events
    Debug.Log("Listen for candidates");
    pc.OnIceGatheringStateChange += state =>
    {
      Debug.Log("OnIceGatheringStateChange");
      if (state == RTCIceGatheringState.Complete) {
        Debug.Log("OnIceGatheringStateChange: Complete");
        endOfCandidates = true;
        mb.StartCoroutine(Tricke());
      }
    };

    // Listen for candidates
    pc.OnIceCandidate += candidate =>
    {
      Debug.Log("OnIceCandidate ");
      // Ignore candidates not from the first m line
      if (candidate.SdpMLineIndex > 0)
        // Skip
        return;
      // Store candidate
      this.candidates.Add(candidate);
    };

    pc.OnConnectionStateChange += state =>
    {
      Debug.Log("OnConnectionStateChange: " + state);
    };

    // Create SDP offer
    var offer = pc.CreateOffer();
    yield return offer;
    RTCSessionDescription rsd = offer.Desc;

    // Request headers
    var headers = new Dictionary<string, string>
        {
            { "Content-Type", "application/sdp" }
        };

    // If token is set
    if (!string.IsNullOrEmpty(token))
      headers["Authorization"] = "Bearer " + token;

    RTCSessionDescription desc;
    using (var httpClient = new UnityWebRequest(url, "POST"))
    {
      if (rsd.sdp == null)
      {
        Debug.LogError("Offer SDP is null");
        yield return 0;
      }
      Debug.Log("=== sdp");
      Debug.Log(rsd.sdp);
      Debug.Log("sdp ===");
      var content = new UploadHandlerRaw(Encoding.UTF8.GetBytes(rsd.sdp));
      content.contentType = "application/sdp";
      httpClient.uploadHandler = content;
      httpClient.downloadHandler = new DownloadHandlerBuffer();

      yield return httpClient.SendWebRequest();

      if (httpClient.result != UnityWebRequest.Result.Success)
      {
        Debug.LogError("Request failed with status " + httpClient.responseCode);
        yield return 0;
      }

      if (!httpClient.GetResponseHeaders().ContainsKey("location"))
      {
        Debug.LogError("Response missing location header");
        yield return 0;
      }

      // Get the resource url
      var ub = new UriBuilder(url);
      ub.Path = httpClient.GetResponseHeaders()["location"];
      resourceURL = ub.ToString();

      etag = httpClient.GetResponseHeaders()["e-tag"];

      // Get the links
      var links = new Dictionary<string, List<(string Url, Dictionary<string, string> Params)>>();

      // If the response contained any links

      // And set remote description
      if (httpClient.GetResponseHeaders().TryGetValue("link", out var linkValues))
      {
        var linkHeaders = linkValues.ToString().Split(new[] { ", " }, StringSplitOptions.None);

        // For each link header
        foreach (var header in linkHeaders)
        {
          try
          {
            string rel = null;
            var parameters = new Dictionary<string, string>();

            // Split into parts
            var items = header.Split(';');
            // Create URL server
            string urlLink = items[0].Trim().Replace("<", "").Replace(">", "").Trim();
            // For each other item
            for (var i = 1; i < items.Length; i++)
            {
              // Split into key/val
              var subitems = items[i].Split('=');
              // Get key
              string key = subitems[0].Trim();
              // Unquote value
              var value = subitems[1]?.Trim().Trim('"', '\'');
              // Check if it is the rel attribute
              if (key == "rel")
                // Get rel value
                rel = value;
              else
                // Unquote value and set them
                parameters[key] = value;
            }
            // Ensure it is an ice server
            if (rel == null)
              continue;
            if (!links.ContainsKey(rel))
              links[rel] = new List<(string Url, Dictionary<string, string> Params)>();
            // Add to config
            links[rel].Add((urlLink, parameters));
          }
          catch (Exception e)
          {
            Debug.LogError(e);
          }
        }
      }

      // Get current config
      var config = pc.GetConfiguration();

      // If it has ice server info and it is not overridden by the client
      if ((config.iceServers == null || config.iceServers.Length == 0) && links.ContainsKey("ice-server"))
      {
        Debug.Log("set config.iceServers");
        // Ice server config
        config.iceServers = new RTCIceServer[] { };

        // For each ice server
        foreach (var server in links["ice-server"])
        {
          int i = 0;
          try
          {
            // Create ice server
            var iceServer = new RTCIceServer();
            iceServer.urls = new string[] { server.Url };

            // For each other param
            foreach (var (key, value) in server.Params)
            {
              // Get key in camel case
              var camelCase = key.Replace("-", "").Replace("_", "");
              // Unquote value and set them
              iceServer.GetType().GetProperty(camelCase)?.SetValue(iceServer, value);
            }
            // Add to config
            config.iceServers[i] = iceServer;
          }
          catch (Exception)
          {
          }
          i++;
        }

        // If any configured
        if (config.iceServers.Length > 0)
          // Set it
          pc.SetConfiguration(ref config);
      }

      // Get the SDP answer
      string answer = httpClient.downloadHandler.text;
      Debug.Log("=== answer");
      Debug.Log(answer);
      Debug.Log("answer ===");
      desc = new RTCSessionDescription { type = RTCSdpType.Answer, sdp = answer };
    }

    yield return pc.SetRemoteDescription(ref desc);

    yield return pc.SetLocalDescription(ref rsd);

    this.ICE_Username = Regex.Match(rsd.sdp, @"a=ice-ufrag:(.*)\r\n").Groups[1].Value;
    this.ICE_Password = Regex.Match(rsd.sdp, @"a=ice-pwd:(.*)\r\n").Groups[1].Value;

  }


  public IEnumerator Tricke()
  {
    Debug.Log("Tricke()");
    // Check if there is any pending data
    if (!(this.candidates.Count > 0 || this.endOfCandidates || restartIce) || string.IsNullOrEmpty(resourceURL))
    {
      // Do nothing
      yield return 0;
    }

    // Get data
    List<RTCIceCandidate> localCandidates = new List<RTCIceCandidate>(candidates);
    bool localEndOfCandidates = endOfCandidates;
    bool localRestartIce = restartIce;

    // Clean pending data before async operation
    candidates.Clear();
    endOfCandidates = false;
    restartIce = false;

    // If we need to restart
    if (localRestartIce)
    {
      // Restart ice
      this.pc.RestartIce();
      // Create a new offer
      var option = new RTCOfferAnswerOptions { iceRestart = true };
      RTCSessionDescriptionAsyncOperation offer = pc.CreateOffer(ref option);
      yield return offer;

      RTCSessionDescription rsd = offer.Desc;
      // Update ice
      string iceUsername = Regex.Match(rsd.sdp, @"a=ice-ufrag:(.*)\r\n").Groups[1].Value;
      string icePassword = Regex.Match(rsd.sdp, @"a=ice-pwd:(.*)\r\n").Groups[1].Value;
      // Set it
      yield return this.pc.SetLocalDescription(ref rsd);
      // Clean end of candidates flag as new ones will be retrieved
      localEndOfCandidates = false;
    }

    // Prepare fragment
    string fragment =
        "a=ice-ufrag:" + ICE_Username + "\r\n" +
        "a=ice-pwd:" + ICE_Password + "\r\n";

    // Get peer connection transceivers
    RTCRtpTransceiver[] transceivers = this.pc.GetTransceivers().ToArray();
    // Get medias
    Dictionary<string, Media> medias = new Dictionary<string, Media>();

    // If doing something else than a restart
    if (localCandidates.Count > 0 || localEndOfCandidates)
    {
      // Create media object for first media always
      medias[transceivers[0].Mid] = new Media
      {
        Mid = transceivers[0].Mid,
        Kind = transceivers[0].Receiver.Track.Kind,
        Candidates = new List<RTCIceCandidate>(),
      };
    }

    // For each candidate
    foreach (RTCIceCandidate candidate in localCandidates)
    {
      // Get mid for candidate
      string mid = candidate.SdpMid;
      // Get associated transceiver
      RTCRtpTransceiver transceiver = Array.Find(transceivers, t => t.Mid == mid);
      // Get media
      Media media = medias.ContainsKey(mid) ? medias[mid] : new Media { Mid = mid, Kind = transceiver.Receiver.Track.Kind, Candidates = new List<RTCIceCandidate>() };
      // Add candidate
      media.Candidates.Add(candidate);
      // Update media in dictionary
      medias[mid] = media;
    }

    // For each media
    foreach (Media media in medias.Values)
    {
      // Add media to fragment
      fragment +=
          "m=" + media.Kind.ToString().ToLower() + " 9 RTP/AVP 0\r\n" +
          "a=mid:" + media.Mid.ToString() + "\r\n";
      // Add candidate
      foreach (RTCIceCandidate candidate in media.Candidates)
        fragment += "a=" + candidate.Candidate + "\r\n";
      if (localEndOfCandidates)
        fragment += "a=end-of-candidates\r\n";
    }

    // Request headers
    Dictionary<string, string> headers = new Dictionary<string, string>
        {
            { "Content-Type", "application/trickle-ice-sdpfrag" }
        };

    // If token is set
    if (!string.IsNullOrEmpty(token))
      headers["Authorization"] = "Bearer " + token;

    // Do the post request to the WHIP resource
    using (UnityWebRequest client = new UnityWebRequest(resourceURL, "PATCH"))
    {
      var content = new UploadHandlerRaw(Encoding.UTF8.GetBytes(fragment));
      Debug.Log("fragment");
      Debug.Log(fragment);
      content.contentType = "application/trickle-ice-sdpfrag";
      client.uploadHandler = content;
      client.downloadHandler = new DownloadHandlerBuffer();
      client.SetRequestHeader("If-Match", etag);

      yield return client.SendWebRequest();

      Debug.Log("trickle-ice responseCode: " + client.responseCode);

      if (client.result != UnityWebRequest.Result.Success)
      {
        Debug.LogError("Request rejected with status " + client.responseCode);
        Debug.LogError(client.downloadHandler.text);
        yield break;
      }

      // If we have got an answer
      if (client.responseCode == 200)
      {
        // Get the SDP answer
        string answer = client.downloadHandler.text;
        Debug.Log("answer");
        Debug.Log(answer);

        // Get remote ice name and password
        string remoteIceUsername = Regex.Match(answer, @"a=ice-ufrag:(.*)\r\n").Groups[1].Value;
        string remoteIcePassword = Regex.Match(answer, @"a=ice-pwd:(.*)\r\n").Groups[1].Value;

        // Get current remote description
        RTCSessionDescription remoteDescription = this.pc.RemoteDescription;

        // Patch
        remoteDescription.sdp = Regex.Replace(remoteDescription.sdp, @"(a=ice-ufrag:)(.*)\r\n", "$1" + remoteIceUsername + "\r\n");
        remoteDescription.sdp = Regex.Replace(remoteDescription.sdp, @"(a=ice-pwd:)(.*)\r\n", "$1" + remoteIcePassword + "\r\n");

        // Set it
        var desc = pc.SetRemoteDescription(ref remoteDescription);
        yield return desc;
      }
    }
  }

  public IEnumerator Stop()
  {
    if (pc == null)
    {
      // Already stopped
      yield return 0;
    }

    // Close peer connection
    pc.Close();

    // Null
    pc = null;

    // If we don't have the resource URL
    if (string.IsNullOrEmpty(resourceURL))
    {
      throw new System.Exception("WHIP resource URL not available yet");
    }

    // Request headers
    Dictionary<string, string> headers = new Dictionary<string, string>();

    // If token is set
    if (!string.IsNullOrEmpty(token))
    {
      headers["Authorization"] = "Bearer " + token;
    }

    // Send a delete
    using (UnityWebRequest www = UnityWebRequest.Delete(resourceURL))
    {
      // Set request headers
      foreach (var header in headers)
      {
        www.SetRequestHeader(header.Key, header.Value);
      }

      // Send the request
      var message = www.SendWebRequest();
      yield return message;

      // Check for errors
      if (www.result != UnityWebRequest.Result.Success)
      {
        Debug.LogError("Error: " + www.error);
      }
      else
      {
        // If successful, handle the response
        Debug.Log("Request successful");
      }
    }
  }

  [Obsolete]
  public IEnumerator Mute(bool muted)
  {
    // Request headers
    Dictionary<string, string> headers = new Dictionary<string, string>
        {
            { "Content-Type", "application/json" }
        };

    // If token is set
    if (!string.IsNullOrEmpty(token))
    {
      headers["Authorization"] = "Bearer " + token;
    }

    // Create JSON payload
    string jsonPayload = JsonUtility.ToJson(new { muted });

    // Do the post request to the WHIP resource
    using (UnityWebRequest www = UnityWebRequest.Post(resourceURL, jsonPayload))
    {
      // Set request headers
      foreach (var header in headers)
      {
        www.SetRequestHeader(header.Key, header.Value);
      }

      // Send the request
      www.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(jsonPayload));
      www.uploadHandler.contentType = "application/json";
      www.downloadHandler = new DownloadHandlerBuffer();

      var message = www.SendWebRequest();
      yield return message;

      // Check for errors
      if (www.result != UnityWebRequest.Result.Success)
      {
        Debug.LogError("Error: " + www.error);
      }
      else
      {
        // If successful, handle the response
        Debug.Log("Request successful");
      }
    }
  }

  public void restart()
  {
    this.restartIce = true;
    this.mb.StartCoroutine(this.Tricke());
  }
}
