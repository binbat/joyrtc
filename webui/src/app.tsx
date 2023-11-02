import "./app.css"
import '../../webcomponent/index'

import { ProtoHttpToWs } from './util';


function App() {
  return (
    <>
      <h1>JoyRTC</h1>
      <joy-rtc address={ ProtoHttpToWs(location.href) + "socket" } style={{ width: "1024px" }}></joy-rtc>
    </>
  )
}

export default App
