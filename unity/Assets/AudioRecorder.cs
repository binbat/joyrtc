using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;

public class AudioRecorder : MonoBehaviour
{
  private AudioSource m_audio;
  private string microphoneDevice;
  private int maxRecordTime = 10;

  // Start is called before the first frame update
  void Start()
  {
    m_audio = GetComponent<AudioSource>();
    microphoneDevice = Microphone.devices[0]; 
  }

  // Update is called once per frame
  void Update()
  {
    // Press R to record audio
    if (Input.GetKeyDown(KeyCode.R))
    {
      StartRecording();
    }
  }

  void StartRecording()
  {
    Debug.Log("开始录制音频");

    AudioClip recordedClip = Microphone.Start(microphoneDevice, false, maxRecordTime, 44100);

    WaitForSeconds recordTime = new WaitForSeconds(maxRecordTime);
    StartCoroutine(StopRecording(recordTime));

    // Play the recorded audio
    m_audio.clip = recordedClip;
    m_audio.Play();

    // Save the recorded audio as a WAV file
    byte[] wavData = SaveToWav(recordedClip);
    string filePath = "C:/Users/Lenovo/Desktop/joyrtc/joyrtc/unity/Assets/file.wav"; // The path where the file is saved

    File.WriteAllBytes(filePath, wavData); // Writes a byte array to a file
  }

  IEnumerator StopRecording(WaitForSeconds recordTime)
  {
    yield return recordTime;

    Microphone.End(microphoneDevice);

    Debug.Log("音频录制完成");
  }

  byte[] SaveToWav(AudioClip audioClip)
  {
    MemoryStream stream = new MemoryStream();

    WriteWavHeader(stream, audioClip);

    // Converts audio data to a byte array
    float[] audioData = new float[audioClip.samples];
    audioClip.GetData(audioData, 0);

    short[] samples = new short[audioData.Length];
    for (int i = 0; i < samples.Length; i++)
    {
      samples[i] = (short)(audioData[i] * short.MaxValue);
    }

    // Writes a byte array to the memory stream
    BinaryWriter writer = new BinaryWriter(stream);
    foreach (short sample in samples)
    {
      writer.Write(sample);
    }

    writer.Dispose();

    return stream.ToArray();
  }

  void WriteWavHeader(Stream stream, AudioClip audioClip)
  {
    BinaryWriter writer = new BinaryWriter(stream);

    // 写入文件标识符 "RIFF"
    writer.Write(0x46464952);

    // 根据数据长度计算文件长度
    int fileSize = audioClip.samples * audioClip.channels * 2 + 36;
    writer.Write(fileSize);

    // 写入文件格式 "WAVE"
    writer.Write(0x45564157);

    // 写入子块1名称 "fmt "
    writer.Write(0x20746D66);

    // 写入子块1大小
    writer.Write(16);

    // 写入音频格式（编码方式）
    writer.Write((short)1);

    // 写入通道数
    writer.Write((short)audioClip.channels);

    // 写入采样率
    writer.Write(audioClip.frequency);

    // 写入每秒字节数
    writer.Write(audioClip.frequency * audioClip.channels * 2);

    // 写入数据块对齐单位
    writer.Write((short)(audioClip.channels * 2));

    // 写入样本位数
    writer.Write((short)16);

    // 写入子块2名称 "data"
    writer.Write(0x61746164);

    // 写入子块2大小
    writer.Write(audioClip.samples * audioClip.channels * 2);
  }
}
