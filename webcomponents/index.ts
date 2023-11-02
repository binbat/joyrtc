import JoyRtcComponent from './model/joy-rtc'
import { DOMAttributes } from "react"

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any } & { style?: any }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['joy-rtc']: CustomElement<JoyRtcComponent>;
    }
  }
}


export * from "./model/joy-rtc"

