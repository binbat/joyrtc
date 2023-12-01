/// <reference path="./types/components.d.ts" />
import './style/index.css'
import "./model/joy-rtc"
import JoyRtcComponent from './model/joy-rtc';
window.addEventListener('DOMContentLoaded', () => {
  const joyrtc = window.document.getElementsByTagName('joy-rtc')[0] as JoyRtcComponent;
  joyrtc.address = window.location.href.replace(/^http/, 'ws') + 'socket';
})
