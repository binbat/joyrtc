import './index'

window.addEventListener('DOMContentLoaded', () => {
  HTMLDivElement;
  const joyrtc = window.document.getElementsByTagName('joy-rtc')[0] as JoyRtcElement;
  joyrtc.address = window.location.href.replace(/^http/, 'ws') + 'socket';
})
