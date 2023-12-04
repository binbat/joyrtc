import "./app.css"
import { ProtoHttpToWs } from './util';
// todo: replace with import from npm package
import "../../webcomponents";

function App() {
  return (
    <>
      <h1>JoyRTC</h1>
      <joy-rtc address={ ProtoHttpToWs(location.href) + "socket" } style={{ width: "1024px" }}></joy-rtc>
    </>
  )
}

export default App
