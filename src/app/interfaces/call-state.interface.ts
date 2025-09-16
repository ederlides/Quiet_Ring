export interface CallState {
  isIncomingCall: boolean;
  isPeerConnectionReady: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected';
  callStatus: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  error: string | null;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError: string | null;
}
