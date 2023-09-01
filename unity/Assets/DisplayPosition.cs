using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class DisplayPosition : MonoBehaviour
{
  // Start is called before the first frame update
  public Text position_X;
  public Text position_Y;
  public Text position_Z;
  private Transform uavtransform;
  void Start()
    {
    uavtransform = transform;
    }

    // Update is called once per frame
    void Update()
    {
    Vector3 position = uavtransform.position;
    position_X.text=  "X:" + position.x.ToString();
    position_Y.text = "Y:" + position.y.ToString();
    position_Z.text = "Z:" + position.z.ToString();
  }
}
