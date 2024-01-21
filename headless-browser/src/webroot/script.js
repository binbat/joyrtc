import { playGameOfLife } from './game-of-life.js';
import { WHIPClient } from '/whip.js';

const cvs = document.getElementsByTagName('canvas')[0];
playGameOfLife(cvs);

const pc = new RTCPeerConnection();
pc.addTransceiver('video', { direction: 'sendonly' });
const ms = cvs.captureStream();
for (const t of ms.getVideoTracks()) {
  console.log('addTrack', t);
  pc.addTrack(t, ms);
}
const whip = new WHIPClient();
// WHIPClient needs a full URL
const url = new URL('/whip/777', location.origin).toString();
whip.publish(pc, url);
