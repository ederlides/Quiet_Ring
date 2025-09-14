import { ElementRef, Injectable, EventEmitter } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { PermissionsService } from './permissions.service';

export interface WebRTCEvent {
  type: 'offer' | 'answer' | 'candidate' | 'error' | 'connection' | 'disconnect';
  data?: any;
}

export interface CallState {
  isConnected: boolean;
  isCalling: boolean;
  hasLocalStream: boolean;
  hasRemoteStream: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebrtcImprovedService {
  private peerConnection: RTCPeerConnection;
  private socket: Socket | null = null;
  private localStream: MediaStream | null = null;
  private remoteVideo!: ElementRef<HTMLVideoElement>;
  private localVideo!: ElementRef<HTMLVideoElement>;
  
  // Event emitters para comunicación con componentes
  public onCallStateChange = new EventEmitter<CallState>();
  public onError = new EventEmitter<string>();
  public onMessage = new EventEmitter<string>();

  private callState: CallState = {
    isConnected: false,
    isCalling: false,
    hasLocalStream: false,
    hasRemoteStream: false
  };

  constructor(private permissionsService: PermissionsService) {
    this.initializePeerConnection();
  }

  /**
   * 🔧 Inicializar PeerConnection con configuración mejorada
   */
  private initializePeerConnection(): void {
    const iceServers = [
      { urls: environment.webrtc.stunServer },
      // Servidores STUN adicionales para mejor conectividad
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];

    this.peerConnection = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10
    });

    this.setupPeerConnectionEventHandlers();
  }

  /**
   * 📡 Configurar manejadores de eventos de PeerConnection
   */
  private setupPeerConnectionEventHandlers(): void {
    // Manejar llegada de pistas remotas
    this.peerConnection.ontrack = (event) => {
      console.log('📡 Stream remoto recibido:', event.streams);
      if (event.streams.length > 0 && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
        this.updateCallState({ hasRemoteStream: true });
      }
    };

    // Manejar ICE Candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        console.log('❄️ Enviando ICE Candidate:', event.candidate);
        this.socket.emit('candidate', event.candidate);
      }
    };

    // Manejar cambios de conexión
    this.peerConnection.onconnectionstatechange = () => {
      const connectionState = this.peerConnection.connectionState;
      console.log('🔗 Estado de conexión:', connectionState);
      
      this.updateCallState({ isConnected: connectionState === 'connected' });
      
      if (connectionState === 'failed') {
        this.handleError('Conexión WebRTC falló');
      }
    };

    // Manejar cambios de señalización
    this.peerConnection.onsignalingstatechange = () => {
      console.log('📶 Estado de señalización:', this.peerConnection.signalingState);
    };

    // Manejar ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 Estado ICE:', this.peerConnection.iceConnectionState);
    };
  }

  /**
   * 🔌 Conectar al servidor WebSocket
   */
  async connectToServer(): Promise<boolean> {
    try {
      if (this.socket && this.socket.connected) {
        console.log('✅ Ya conectado al servidor');
        return true;
      }

      console.log('🔌 Conectando al servidor WebRTC...');
      
      this.socket = io(environment.webrtc.serverUrl, {
        transports: environment.webrtc.transports,
        withCredentials: environment.webrtc.credentials,
        timeout: 10000,
        forceNew: true
      });

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket no inicializado'));
          return;
        }

        this.socket.on('connect', () => {
          console.log('✅ Conectado al servidor WebRTC');
          this.setupSocketEventHandlers();
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Error conectando al servidor:', error);
          this.handleError(`Error de conexión: ${error.message}`);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Desconectado del servidor:', reason);
          this.updateCallState({ isConnected: false });
        });

        // Timeout de conexión
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error('Timeout de conexión'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('❌ Error conectando al servidor:', error);
      this.handleError('No se pudo conectar al servidor');
      return false;
    }
  }

  /**
   * 📡 Configurar manejadores de eventos del socket
   */
  private setupSocketEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('offer', async (offer) => {
      console.log('📡 Oferta recibida:', offer);
      await this.handleIncomingOffer(offer);
    });

    this.socket.on('answer', async (answer) => {
      console.log('✅ Respuesta recibida:', answer);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    this.socket.on('candidate', async (candidate) => {
      console.log('❄️ ICE Candidate recibido:', candidate);
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    this.socket.on('error', (error) => {
      console.error('❌ Error del servidor:', error);
      this.handleError(`Error del servidor: ${error.message || error}`);
    });
  }

  /**
   * 🎥 Iniciar stream local con manejo de permisos
   */
  async startLocalStream(videoElement?: ElementRef<HTMLVideoElement>): Promise<boolean> {
    try {
      console.log('🎥 Iniciando stream local...');
      
      // Solicitar permisos primero
      const hasPermissions = await this.permissionsService.requestCameraAndAudioPermissions();
      if (!hasPermissions) {
        throw new Error('Permisos de cámara y audio denegados');
      }

      // Obtener stream local
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!this.localStream) {
        throw new Error('No se pudo obtener el stream local');
      }

      // Agregar pistas al PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream!);
      });

      // Mostrar stream local si se proporciona elemento
      if (videoElement) {
        this.localVideo = videoElement;
        this.localVideo.nativeElement.srcObject = this.localStream;
      }

      this.updateCallState({ hasLocalStream: true });
      console.log('✅ Stream local iniciado correctamente');
      
      return true;
    } catch (error) {
      console.error('❌ Error iniciando stream local:', error);
      this.handleError('No se pudo acceder a la cámara o micrófono');
      return false;
    }
  }

  /**
   * 📞 Iniciar llamada
   */
  async startCall(): Promise<boolean> {
    try {
      if (!this.socket?.connected) {
        throw new Error('No conectado al servidor');
      }

      if (!this.localStream) {
        throw new Error('Stream local no disponible');
      }

      console.log('📞 Iniciando llamada...');
      this.updateCallState({ isCalling: true });

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit('offer', offer);

      console.log('✅ Oferta enviada');
      return true;
    } catch (error) {
      console.error('❌ Error iniciando llamada:', error);
      this.handleError('No se pudo iniciar la llamada');
      return false;
    }
  }

  /**
   * 📞 Responder a llamada entrante
   */
  private async handleIncomingOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      if (this.socket) {
        this.socket.emit('answer', answer);
        console.log('✅ Respuesta enviada');
      }
    } catch (error) {
      console.error('❌ Error manejando oferta:', error);
      this.handleError('Error procesando llamada entrante');
    }
  }

  /**
   * 🔇 Mute/Unmute audio
   */
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('🔊 Audio:', audioTrack.enabled ? 'activado' : 'desactivado');
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * 📹 Mute/Unmute video
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('📹 Video:', videoTrack.enabled ? 'activado' : 'desactivado');
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * 📞 Finalizar llamada
   */
  async endCall(): Promise<void> {
    console.log('📞 Finalizando llamada...');
    
    this.updateCallState({
      isCalling: false,
      isConnected: false,
      hasRemoteStream: false
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this.updateCallState({ hasLocalStream: false });
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.initializePeerConnection();
    }

    if (this.socket) {
      this.socket.emit('end-call');
    }
  }

  /**
   * 🔌 Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.updateCallState({
      isConnected: false,
      isCalling: false
    });
  }

  /**
   * 📊 Actualizar estado de la llamada
   */
  private updateCallState(updates: Partial<CallState>): void {
    this.callState = { ...this.callState, ...updates };
    this.onCallStateChange.emit(this.callState);
  }

  /**
   * ❌ Manejar errores
   */
  private handleError(message: string): void {
    console.error('❌ Error:', message);
    this.updateCallState({ error: message });
    this.onError.emit(message);
  }

  /**
   * 📊 Obtener estado actual
   */
  getCallState(): CallState {
    return { ...this.callState };
  }

  /**
   * 🧹 Limpiar recursos
   */
  destroy(): void {
    this.endCall();
    this.disconnect();
  }
}
