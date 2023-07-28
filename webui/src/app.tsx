import { DOMAttributes } from "react"
import "./app.css"

import JoyRtcComponent from './joy-rtc'
import './joy-rtc'

import { ProtoHttpToWs } from './util';

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any } & { style?: any }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['joy-rtc']: CustomElement<JoyRtcComponent>;
    }
  }
}

function App() {
  return (
    <>
      <h1>JoyRTC</h1>
      <joy-rtc address={ ProtoHttpToWs(location.href) + "socket" } style={{ width: "1024px" }}></joy-rtc>
    </>
  )
}

export default App
