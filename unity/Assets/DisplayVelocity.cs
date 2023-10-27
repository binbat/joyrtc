using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class DisplayVelocity: MonoBehaviour
{
  // Start is called before the first frame update
  public Text velocity_X;
  public Text velocity_Y;
  public Text velocity_Z;
  private Rigidbody rb;
  public joyrtc JoyrtcComponent; // 引用 joyrtc 组件

  private void Start()
  {
    rb = GetComponent<Rigidbody>();
  }

  private void Update()
  {
    Vector3 velocity = rb.velocity;
    velocity_X.text = "X:"+velocity.x.ToString();
    velocity_Y.text = "Y:"+velocity.y.ToString();
    velocity_Z.text = "Z:"+velocity.z.ToString();


    // 将速度数据存储到 joyrtc 组件的变量中
    JoyrtcComponent.VelocityX = velocity.x;
    JoyrtcComponent.VelocityY = velocity.y;
    JoyrtcComponent.VelocityZ = velocity.z;
  }
}
