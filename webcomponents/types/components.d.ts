import JoyRtcComponent from '../model/joy-rtc'

type CustomElement<T extends HTMLElement> = Partial<T & { children?: any } & { style?: any }>;

declare global {
  type JoyRtcElement = CustomElement<JoyRtcComponent>;
  var JoyRtcElement: {
    new(): JoyRtcElement;
    prototype: JoyRtcElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      ['joy-rtc']: JoyRtcElement;
    }
  }
}
