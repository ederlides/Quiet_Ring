import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { PermissionsService } from './permissions.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { CallState, WebSocketState } from '../interfaces/call-state.interface';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService implements OnDestroy {
  public camera: any;
  private socket: Socket;
  private roomId = localStorage.getItem('room');

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  availableMicrophones: MediaDeviceInfo[] = [];
  
  // Configuración WebRTC mejorada
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Estados centralizados
  private callState = new BehaviorSubject<CallState>({
    isIncomingCall: false,
    isPeerConnectionReady: false,
    connectionState: 'disconnected',
    callStatus: 'idle',
    error: null
  });

  private webSocketState = new BehaviorSubject<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    lastError: null
  });

  // Configuración de reconexión
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectAttempts = 0;

  // Estados legacy (para compatibilidad)
  isIncomingCall = false;
  incomingOffer: RTCSessionDescriptionInit | null = null;
  isPeerConnectionReady = false;
  pendingCandidates: RTCIceCandidate[] = [];

  // Elementos de video serán seteados desde el componente
  localVideoElement: HTMLVideoElement | null = null;
  remoteVideoElement: HTMLVideoElement | null = null;

  constructor(
    private router: Router,
    private permissionsService: PermissionsService
  ) {
    this.initializeSocket();
  }

  /**
   * Inicializa la conexión WebSocket con manejo robusto de errores
   */
  private initializeSocket() {
    console.log('🔌 Inicializando conexión WebSocket...');
    
    this.socket = io(environment.api.socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
      forceNew: true
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado exitosamente');
      this.updateWebSocketState({
        isConnected: true,
        isConnecting: false,
        reconnectAttempts: 0,
        lastError: null
      });
      this.updateCallState({ connectionState: 'connected' });
      this.joinRoom();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
      this.updateWebSocketState({
        isConnected: false,
        isConnecting: false,
        lastError: reason
      });
      this.updateCallState({ connectionState: 'disconnected' });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      this.updateWebSocketState({
        isConnected: false,
        isConnecting: false,
        lastError: error.message
      });
      this.updateCallState({ 
        connectionState: 'disconnected',
        error: `Error de conexión: ${error.message}`
      });
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reintentando conexión WebSocket (${attempt}/${this.maxReconnectAttempts})`);
      this.updateWebSocketState({
        isConnecting: true,
        reconnectAttempts: attempt
      });
      this.updateCallState({ connectionState: 'connecting' });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión WebSocket después de todos los intentos');
      this.updateWebSocketState({
        isConnected: false,
        isConnecting: false,
        lastError: 'Reconexión fallida'
      });
      this.updateCallState({ 
        connectionState: 'disconnected',
        error: 'No se pudo reconectar al servidor'
      });
    });

    // Eventos de WebRTC
    this.socket.on('offer', async offer => {
      console.log('📞 Llamada entrante recibida');
      this.incomingOffer = offer;
      this.isIncomingCall = true;
      this.updateCallState({ 
        isIncomingCall: true,
        callStatus: 'ringing'
      });
      this.router.navigate(['/call']);
    });

    this.socket.on('ice-candidate', async c => {
      if (this.isPeerConnectionReady && this.peerConnection) {
        await this.addIce(c);
      } else {
        this.pendingCandidates.push(c);
      }
    });

    this.socket.on('answer', async answer => {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(answer);
        this.updateCallState({ callStatus: 'connected' });
      }
    });
  }

  /**
   * Se une a la sala después de validar autenticación
   */
  private joinRoom() {
    if (!this.validateAuthentication()) {
      return;
    }
    
    if (this.roomId) {
      console.log('🚪 Uniéndose a la sala:', this.roomId);
      this.socket.emit('join', this.roomId);
    } else {
      console.error('❌ No hay roomId disponible');
      this.updateCallState({ error: 'No hay sala disponible' });
    }
  }

  /**
   * Valida que el usuario esté autenticado
   */
  private validateAuthentication(): boolean {
    const token = localStorage.getItem('token');
    const roomId = localStorage.getItem('room');
    
    if (!token || !roomId) {
      console.error('❌ Usuario no autenticado');
      this.updateCallState({ error: 'Usuario no autenticado' });
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }

  setVideoElements(local: HTMLVideoElement, remote: HTMLVideoElement) {
    this.localVideoElement = local;
    this.remoteVideoElement = remote;
  }

  /**
   * Actualiza el estado de la llamada
   */
  private updateCallState(updates: Partial<CallState>) {
    const currentState = this.callState.value;
    this.callState.next({ ...currentState, ...updates });
    
    // Sincronizar estados legacy
    this.isIncomingCall = this.callState.value.isIncomingCall;
    this.isPeerConnectionReady = this.callState.value.isPeerConnectionReady;
  }

  /**
   * Actualiza el estado del WebSocket
   */
  private updateWebSocketState(updates: Partial<WebSocketState>) {
    const currentState = this.webSocketState.value;
    this.webSocketState.next({ ...currentState, ...updates });
  }

  /**
   * Obtiene el estado actual de la llamada
   */
  getCallState$(): Observable<CallState> {
    return this.callState.asObservable();
  }

  /**
   * Obtiene el estado actual del WebSocket
   */
  getWebSocketState$(): Observable<WebSocketState> {
    return this.webSocketState.asObservable();
  }

  /**
   * Ejecuta una operación con timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    errorMessage: string
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Maneja errores de llamada
   */
  private handleCallError(error: any) {
    console.error('❌ Error en llamada:', error);
    this.updateCallState({ 
      error: error.message || 'Error desconocido en la llamada',
      callStatus: 'ended'
    });
  }

  /**
   * Cleanup de recursos
   */
  ngOnDestroy() {
    this.cleanup();
  }

  private cleanup() {
    console.log('🧹 Limpiando recursos...');
    
    // Cerrar WebSocket
    if (this.socket) {
      this.socket.disconnect();
    }

    // Cerrar PeerConnection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Detener streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Limpiar elementos de video
    if (this.localVideoElement) {
      this.localVideoElement.srcObject = null;
    }
    if (this.remoteVideoElement) {
      this.remoteVideoElement.srcObject = null;
    }

    // Resetear estados
    this.updateCallState({
      isIncomingCall: false,
      isPeerConnectionReady: false,
      callStatus: 'idle',
      error: null
    });

    this.pendingCandidates = [];
    this.incomingOffer = null;
  }

  /**
   * Verifica si la aplicación tiene todos los permisos necesarios para realizar llamadas
   */
  async verifyCallPermissions(): Promise<{
    success: boolean;
    message: string;
    permissions: {
      audio: boolean;
      camera: boolean;
    };
  }> {
    try {
      console.log('🔍 Verificando permisos para llamadas...');
      
      const permissions = await this.permissionsService.checkAllCallPermissions();
      
      if (permissions.allGranted) {
        return {
          success: true,
          message: 'Todos los permisos están concedidos',
          permissions
        };
      } else {
        const missingPermissions: string[] = [];
        if (!permissions.audio) missingPermissions.push('audio');
        if (!permissions.camera) missingPermissions.push('cámara');
        
        return {
          success: false,
          message: `Permisos faltantes: ${missingPermissions.join(', ')}`,
          permissions
        };
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return {
        success: false,
        message: 'Error al verificar permisos',
        permissions: { audio: false, camera: false }
      };
    }
  }

  /**
   * Solicita todos los permisos necesarios para realizar llamadas
   */
  async requestCallPermissions(): Promise<{
    success: boolean;
    message: string;
    permissions: {
      audio: boolean;
      camera: boolean;
    };
  }> {
    try {
      console.log('📋 Solicitando permisos para llamadas...');
      
      const permissions = await this.permissionsService.requestAllCallPermissions();
      
      if (permissions.allGranted) {
        return {
          success: true,
          message: 'Todos los permisos han sido concedidos',
          permissions
        };
      } else {
        const missingPermissions: string[] = [];
        if (!permissions.audio) missingPermissions.push('audio');
        if (!permissions.camera) missingPermissions.push('cámara');
        
        return {
          success: false,
          message: `Permisos denegados: ${missingPermissions.join(', ')}`,
          permissions
        };
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return {
        success: false,
        message: 'Error al solicitar permisos',
        permissions: { audio: false, camera: false }
      };
    }
  }
  async initLocal() {
    try {
      console.log('🎬 Iniciando configuración de medios locales...');

      // 🔁 Detener stream anterior si existe
      if (this.localStream) {
        console.log('🔄 Deteniendo stream anterior...');
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // 🔐 VERIFICAR PERMISOS PRIMERO
      console.log('🔐 Verificando permisos...');
      const hasPermissions = await this.permissionsService.requestMicrophoneAccess();
      if (!hasPermissions) {
        throw new Error('Permisos de micrófono denegados o no disponibles');
      }

      // 📋 Obtener lista de dispositivos
      console.log('📋 Enumerando dispositivos disponibles...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(d => d.kind === 'videoinput');
      const microfonos = devices.filter(d => d.kind === 'audioinput');

      console.log(`📹 Cámara disponible: ${hasCamera}`);
      console.log(`🎤 Micrófonos disponibles: ${microfonos.length}`);

      if (!hasCamera) throw new Error('No se detectó una cámara.');
      if (microfonos.length === 0) throw new Error('No se detectó un micrófono.');

      this.availableMicrophones = microfonos;

      // ✅ Obtener streams con configuración mejorada
      console.log('🎥 Obteniendo streams de medios...');
      const [videoStream, audioStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
            frameRate: { ideal: 30, max: 30 }
          } 
        }),
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          } 
        })
      ]);

      console.log('✅ Streams obtenidos exitosamente');

      // 🧩 Combinar pistas en un solo MediaStream
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      this.localStream = combinedStream;

      // 🎥 Asignar stream al video local
      if (this.localVideoElement) {
        this.localVideoElement.srcObject = this.localStream;
        this.localVideoElement.muted = true; // Evita eco
        console.log('🎥 Stream asignado al elemento de video local');
      }

      // 🧪 Logs detallados para debugging
      const audioTracks = this.localStream.getAudioTracks();
      const videoTracks = this.localStream.getVideoTracks();
      
      console.log('🎧 Audio Tracks:', audioTracks.length);
      console.log('📹 Video Tracks:', videoTracks.length);

      audioTracks.forEach((track, index) => {
        console.log(`🎤 Audio Track #${index}:`);
        console.log(`   - Label: ${track.label}`);
        console.log(`   - Enabled: ${track.enabled}`);
        console.log(`   - Muted: ${track.muted}`);
        console.log(`   - Ready State: ${track.readyState}`);
        console.log(`   - Settings:`, track.getSettings());
      });

      videoTracks.forEach((track, index) => {
        console.log(`📹 Video Track #${index}:`);
        console.log(`   - Label: ${track.label}`);
        console.log(`   - Enabled: ${track.enabled}`);
        console.log(`   - Ready State: ${track.readyState}`);
        console.log(`   - Settings:`, track.getSettings());
      });

      console.log('✅ Inicialización de medios locales completada exitosamente');

    } catch (err: any) {
      console.error('🛑 Error al inicializar cámara/micrófono:', err.name, err.message);

      if (err.name === 'NotReadableError') {
        this.camera = '⚠️ Cámara o micrófono en uso por otra aplicación.';
      } else if (err.name === 'NotAllowedError') {
        this.camera = '❌ Permiso denegado para usar cámara o micrófono.';
      } else if (err.name === 'NotFoundError') {
        this.camera = '❌ No se encontró cámara o micrófono en el dispositivo.';
      } else if (err.name === 'OverconstrainedError') {
        this.camera = '⚠️ Configuración de cámara/micrófono no soportada.';
      } else if (err.name === 'SecurityError') {
        this.camera = '🔒 Error de seguridad al acceder a cámara/micrófono.';
      } else if (err.name === 'TypeError') {
        this.camera = '⚠️ Error de tipo al acceder a medios.';
      } else {
        this.camera = `❌ Error inesperado: ${err.name} - ${err.message}`;
      }

      // Re-lanzar el error para que sea manejado por el componente
      throw err;
    }
  }




  async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.peerConnection.onicecandidate = e => {
      if (e.candidate) {
        this.socket.emit('ice-candidate', e.candidate, this.roomId);
      }
    };

    this.peerConnection.ontrack = e => {
      if (this.remoteVideoElement) {
        const stream = this.remoteVideoElement.srcObject as MediaStream || new MediaStream();
        stream.addTrack(e.track);
        this.remoteVideoElement.srcObject = stream;
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }
  }

  async acceptCall() {
    try {
      console.log('📞 Aceptando llamada entrante...');
      
      // Validar conexión WebSocket
      if (!this.webSocketState.value.isConnected) {
        throw new Error('WebSocket no conectado');
      }

      // Validar autenticación
      if (!this.validateAuthentication()) {
        throw new Error('Usuario no autenticado');
      }
      
      // 🔐 Verificar permisos antes de aceptar la llamada
      const permissionCheck = await this.verifyCallPermissions();
      if (!permissionCheck.success) {
        console.warn('⚠️ Permisos faltantes, solicitando...');
        const permissionRequest = await this.requestCallPermissions();
        if (!permissionRequest.success) {
          throw new Error(`No se pueden aceptar llamadas: ${permissionRequest.message}`);
        }
      }

      this.updateCallState({ callStatus: 'calling' });

      // Inicializar medios con timeout
      await this.withTimeout(
        this.initLocal(),
        10000,
        'Timeout al inicializar medios locales'
      );

      // Crear PeerConnection con timeout
      await this.withTimeout(
        this.createPeerConnection(),
        5000,
        'Timeout al crear PeerConnection'
      );

      if (this.incomingOffer && this.peerConnection) {
        await this.withTimeout(
          this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.incomingOffer)),
          5000,
          'Timeout al establecer descripción remota'
        );

        const answer = await this.withTimeout(
          this.peerConnection.createAnswer(),
          5000,
          'Timeout al crear respuesta'
        );

        await this.withTimeout(
          this.peerConnection.setLocalDescription(answer),
          5000,
          'Timeout al establecer descripción local'
        );

        this.socket.emit('answer', answer, this.roomId);

        this.isPeerConnectionReady = true;
        this.updateCallState({ isPeerConnectionReady: true });

        // Procesar candidatos pendientes
        for (const c of this.pendingCandidates) {
          await this.addIce(c);
        }
        this.pendingCandidates = [];
        
        this.updateCallState({ 
          callStatus: 'connected',
          isIncomingCall: false 
        });
        
        console.log('✅ Llamada aceptada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al aceptar llamada:', error);
      this.handleCallError(error);
      throw error;
    }
  }

  async callPeer() {
    try {
      console.log('📞 Iniciando llamada saliente...');
      
      // Validar conexión WebSocket
      if (!this.webSocketState.value.isConnected) {
        throw new Error('WebSocket no conectado');
      }

      // Validar autenticación
      if (!this.validateAuthentication()) {
        throw new Error('Usuario no autenticado');
      }
      
      // 🔐 Verificar permisos antes de iniciar la llamada
      const permissionCheck = await this.verifyCallPermissions();
      if (!permissionCheck.success) {
        console.warn('⚠️ Permisos faltantes, solicitando...');
        const permissionRequest = await this.requestCallPermissions();
        if (!permissionRequest.success) {
          throw new Error(`No se pueden realizar llamadas: ${permissionRequest.message}`);
        }
      }

      this.updateCallState({ callStatus: 'calling' });

      // Inicializar medios con timeout
      await this.withTimeout(
        this.initLocal(),
        10000,
        'Timeout al inicializar medios locales'
      );

      // Crear PeerConnection con timeout
      await this.withTimeout(
        this.createPeerConnection(),
        5000,
        'Timeout al crear PeerConnection'
      );

      if (this.peerConnection) {
        const offer = await this.withTimeout(
          this.peerConnection.createOffer(),
          5000,
          'Timeout al crear oferta'
        );

        await this.withTimeout(
          this.peerConnection.setLocalDescription(offer),
          5000,
          'Timeout al establecer descripción local'
        );

        this.socket.emit('offer', offer, this.roomId);
        this.isPeerConnectionReady = true;
        this.updateCallState({ isPeerConnectionReady: true });
        
        console.log('✅ Llamada iniciada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al iniciar llamada:', error);
      this.handleCallError(error);
      throw error;
    }
  }

  async addIce(candidate: RTCIceCandidate) {
    try {
      await this.peerConnection?.addIceCandidate(candidate);
    } catch (err) {
      console.error('Error adding ICE candidate', err);
    }
  }

  endCall() {
    console.log('📞 Finalizando llamada...');
    
    this.updateCallState({ callStatus: 'ended' });
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteVideoElement) {
      this.remoteVideoElement.srcObject = null;
    }

    if (this.localVideoElement) {
      this.localVideoElement.srcObject = null;
    }

    this.updateCallState({
      isIncomingCall: false,
      isPeerConnectionReady: false,
      callStatus: 'idle',
      error: null
    });
    
    this.pendingCandidates = [];
    this.incomingOffer = null;
    
    console.log('✅ Llamada finalizada');
  }
}
