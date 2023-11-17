export declare class JoyRtcComponent extends HTMLElement {
    private ws;
    private pc;
    private dc;
    private bar;
    private root;
    private domWsState;
    private domPcState;
    private domDcState;
    private domGamepadState;
    private gamepadIndex;
    private gamepadAxesListener;
    constructor();
    set websocketState(state: string);
    set webrtcState(state: string);
    set dataChannelState(state: string);
    get debug(): boolean;
    get autoplay(): boolean;
    get address(): string;
    set address(value: string);
    startWebsocket(): void;
    startWebRTC(): Promise<void>;
    private startGamepadListening;
    private checkGamepadAxes;
    handleClick(): void;
    connectedCallback(): void;
}
export default JoyRtcComponent;
