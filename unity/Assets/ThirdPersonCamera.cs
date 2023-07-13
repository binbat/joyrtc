using UnityEngine;

public class ThirdPersonCamera : MonoBehaviour
{
    public Transform target;
    public float distance = 2f;
    public float height = 1f;
    public float rotationDamping = 10f;
    public float heightDamping = 5f;
    private bool modifyValues = false;

    public void ToggleModifyValues()
    {
        modifyValues = !modifyValues;
    }
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.C))
        {
            modifyValues = !modifyValues; // ÇÐ»» modifyValues µÄ×´Ì¬
        }
    }

    void LateUpdate()
    {
        if (target == null)
            return;

        float wantedRotationAngle = target.eulerAngles.y;
        float wantedHeight = target.position.y + (modifyValues ? 0.2f : height);

        float currentRotationAngle = transform.eulerAngles.y;
        float currentHeight = transform.position.y;

        currentRotationAngle = Mathf.LerpAngle(currentRotationAngle, wantedRotationAngle, rotationDamping * Time.deltaTime);
        currentHeight = Mathf.Lerp(currentHeight, wantedHeight, heightDamping * Time.deltaTime);

        Quaternion currentRotation = Quaternion.Euler(0, currentRotationAngle, 0);

        Vector3 targetPosition = target.position - currentRotation * Vector3.forward * (modifyValues ? 1f : distance);
        targetPosition.y = currentHeight;

        transform.position = targetPosition;
        transform.LookAt(target);
    }
}
