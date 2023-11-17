import JoyRtcComponent from '../model/joy-rtc'



type CustomElement<T extends HTMLElement> = Partial<T & { children?: any } & { style?: any }>;

declare global {
    namespace JSX {
      interface IntrinsicElements {
        ['joy-rtc']: CustomElement<JoyRtcComponent>;
      }
    }
  }
  