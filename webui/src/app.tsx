import { useState } from 'react';

import "./app.css"
import { ProtoHttpToWs } from './util';
// todo: replace with import from npm package
import "../../webcomponents";

const whepAddress = {
  whep: true,
  address: location.href + "whep/777"
};
const wsAddress = {
  address: ProtoHttpToWs(location.href) + "socket"
};

function App() {
  const [mode, setMode] = useState('whep')
  return (
    <>
      <h1>JoyRTC</h1>
      <table>
        <tbody>
          <tr>
            <th>Connection Mode</th>
            <td>
              <select onChange={(e) => setMode(e.target.value)}>
                <option value={'whep'}>WHEP</option>
                <option value={'ws'}>WebSocket</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <joy-rtc {...(mode === 'whep' ? whepAddress : wsAddress)} style={{ width: "1024px" }}></joy-rtc>
    </>
  )
}

export default App
