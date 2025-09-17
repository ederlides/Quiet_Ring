import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { Router } from '@angular/router';
import { PermissionsService } from './permissions.service';
import { MobileOptimizationService } from './mobile-optimization.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { CallState, WebSocketState } from '../interfaces/call-state.interface';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService implements OnDestroy {
  public camera: any;
  private socket: any;
  private roomId = localStorage.getItem('room');

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  availableMicrophones: MediaDeviceInfo[] = [];
  
  // Configuración WebRTC optimizada para dispositivos móviles
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
    // 🎯 Optimizaciones para móviles
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: 'all',
    // 🔧 Configuración de codecs optimizada
    // sdpSemantics: 'unified-plan' // Removido por compatibilidad
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
    private permissionsService: PermissionsService,
    private mobileOptimization: MobileOptimizationService
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
      console.log('📞 Llamada entrante recibida:', offer);
      this.incomingOffer = offer;
      this.isIncomingCall = true;
      this.updateCallState({ 
        isIncomingCall: true,
        callStatus: 'ringing'
      });
      
      // Limpiar candidatos pendientes de llamadas anteriores
      this.pendingCandidates = [];
      
      this.router.navigate(['/call']);
    });

    this.socket.on('ice-candidate', async c => {
      console.log('🧊 ICE candidate recibido:', c);
      if (this.isPeerConnectionReady && this.peerConnection) {
        try {
        await this.addIce(c);
          console.log('✅ ICE candidate agregado exitosamente');
        } catch (error) {
          console.error('❌ Error agregando ICE candidate:', error);
        }
      } else {
        console.log('⏳ ICE candidate guardado como pendiente');
        this.pendingCandidates.push(c);
      }
    });

    this.socket.on('answer', async answer => {
      console.log('📞 Respuesta recibida:', answer);
      if (this.peerConnection) {
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          this.updateCallState({ callStatus: 'connected' });
          console.log('✅ Respuesta establecida exitosamente');
          
          // Procesar candidatos pendientes después de establecer la respuesta
          for (const candidate of this.pendingCandidates) {
            try {
              await this.addIce(candidate);
              console.log('✅ Candidato pendiente procesado');
            } catch (error) {
              console.error('❌ Error procesando candidato pendiente:', error);
            }
          }
          this.pendingCandidates = [];
        } catch (error) {
          console.error('❌ Error estableciendo respuesta:', error);
          this.handleCallError(error);
        }
      }
    });

    // Evento para cuando la llamada es rechazada o cancelada
    this.socket.on('call-ended', () => {
      console.log('📞 Llamada terminada por el otro usuario');
      this.updateCallState({ 
        callStatus: 'ended',
        isIncomingCall: false 
      });
      this.endCall();
    });

    // Evento para cuando hay un error en la llamada
    this.socket.on('call-error', (error) => {
      console.error('❌ Error en la llamada:', error);
      this.handleCallError(new Error(error));
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
    
    // Aplicar optimizaciones específicas para móviles
    this.applyMobileOptimizations();
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
   * Verifica el estado de la conexión WebRTC
   */
  getConnectionState(): string {
    if (!this.peerConnection) {
      return 'No inicializada';
    }
    return this.peerConnection.connectionState;
  }

  /**
   * Verifica si hay un stream remoto activo
   */
  hasRemoteStream(): boolean {
    return this.remoteVideoElement?.srcObject !== null;
  }

  /**
   * Verifica si hay un stream local activo
   */
  hasLocalStream(): boolean {
    return this.localStream !== null && this.localStream.active;
  }

  /**
   * Verifica el estado del audio en la llamada
   */
  getAudioStatus(): {
    hasAudio: boolean;
    audioTracks: number;
    activeAudioTracks: number;
    audioEnabled: boolean;
  } {
    if (!this.localStream) {
      return {
        hasAudio: false,
        audioTracks: 0,
        activeAudioTracks: 0,
        audioEnabled: false
      };
    }

    const audioTracks = this.localStream.getAudioTracks();
    const activeAudioTracks = audioTracks.filter(track => 
      track.enabled && track.readyState === 'live'
    );

    return {
      hasAudio: audioTracks.length > 0,
      audioTracks: audioTracks.length,
      activeAudioTracks: activeAudioTracks.length,
      audioEnabled: activeAudioTracks.length > 0
    };
  }

  /**
   * Habilita o deshabilita el audio
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
        console.log(`🎤 Audio track ${enabled ? 'habilitado' : 'deshabilitado'}:`, track.label);
      });
    }
  }

  /**
   * Verifica si el audio está siendo transmitido
   */
  isAudioTransmitting(): boolean {
    const status = this.getAudioStatus();
    return status.hasAudio && status.audioEnabled && status.activeAudioTracks > 0;
  }

  /**
   * Detecta si es un dispositivo móvil
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Obtiene la configuración optimizada según el dispositivo
   */
  private getOptimizedConstraints(): MediaStreamConstraints {
    const isMobile = this.isMobileDevice();
    
    if (isMobile) {
      return {
        video: { 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 24, max: 30 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
          // googEchoCancellation: true, // Removido por compatibilidad
          // googAutoGainControl: true,   // Removido por compatibilidad
          // googNoiseSuppression: true   // Removido por compatibilidad
        }
      };
    } else {
      return {
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      };
    }
  }

  /**
   * Aplica optimizaciones específicas para móviles
   */
  private applyMobileOptimizations(): void {
    if (this.isMobileDevice()) {
      console.log('📱 Aplicando optimizaciones para dispositivos móviles...');
      
      // Optimizar elementos de video para móviles
      if (this.localVideoElement) {
        this.localVideoElement.playsInline = true;
        this.localVideoElement.muted = true;
        this.localVideoElement.setAttribute('webkit-playsinline', 'true');
      }
      
      if (this.remoteVideoElement) {
        this.remoteVideoElement.playsInline = true;
        this.remoteVideoElement.setAttribute('webkit-playsinline', 'true');
      }
    }
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

      // ✅ Obtener stream combinado con configuración optimizada según el dispositivo
      console.log('🎥 Obteniendo stream de medios combinado...');
      const constraints = this.getOptimizedConstraints();
      const combinedStream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Stream combinado obtenido exitosamente');

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

      // 🔍 Validación crítica de audio
      if (audioTracks.length === 0) {
        throw new Error('No se obtuvieron tracks de audio del stream');
      }

      const activeAudioTracks = audioTracks.filter(track => track.enabled && track.readyState === 'live');
      if (activeAudioTracks.length === 0) {
        throw new Error('No hay tracks de audio activos');
      }

      console.log(`✅ Audio tracks activos: ${activeAudioTracks.length}/${audioTracks.length}`);

      audioTracks.forEach((track, index) => {
        console.log(`🎤 Audio Track #${index}:`);
        console.log(`   - Label: ${track.label}`);
        console.log(`   - Enabled: ${track.enabled}`);
        console.log(`   - Muted: ${track.muted}`);
        console.log(`   - Ready State: ${track.readyState}`);
        console.log(`   - Settings:`, track.getSettings());
        
        // Validar que el track esté funcionando
        if (track.readyState !== 'live') {
          console.warn(`⚠️ Audio track #${index} no está en estado 'live'`);
        }
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
      console.log('📡 Track remoto recibido:', e.track.kind);
      if (this.remoteVideoElement) {
        const stream = this.remoteVideoElement.srcObject as MediaStream || new MediaStream();
        stream.addTrack(e.track);
        this.remoteVideoElement.srcObject = stream;
        
        // Configurar audio optimizado para el video
        this.remoteVideoElement.volume = 1.0;
        this.remoteVideoElement.muted = false;
        
        // Log específico para audio
        if (e.track.kind === 'audio') {
          console.log('🎧 Audio track remoto agregado exitosamente');
          console.log('   - Label:', e.track.label);
          console.log('   - Enabled:', e.track.enabled);
          console.log('   - Ready State:', e.track.readyState);
          
          // Configurar audio específico
          this.remoteVideoElement.volume = 1.0;
          this.remoteVideoElement.muted = false;
          
          // Forzar reproducción de audio
          this.remoteVideoElement.play().catch(err => {
            console.warn('⚠️ Error reproduciendo audio:', err);
          });
        }
      }
    };

    if (this.localStream) {
      console.log('🔗 Agregando tracks locales al PeerConnection...');
      const audioTracks = this.localStream.getAudioTracks();
      const videoTracks = this.localStream.getVideoTracks();
      
      console.log(`🎧 Agregando ${audioTracks.length} audio tracks`);
      console.log(`📹 Agregando ${videoTracks.length} video tracks`);
      
      this.localStream.getTracks().forEach((track, index) => {
        console.log(`🔗 Agregando track #${index} (${track.kind}):`, track.label);
        this.peerConnection?.addTrack(track, this.localStream!);
      });
      
      console.log('✅ Todos los tracks agregados al PeerConnection');
    }
  }

  async acceptCall() {
    try {
      console.log('📞 Aceptando llamada entrante...');
      
      // Aplicar optimizaciones móviles
      await this.mobileOptimization.optimizeForVideoCall();
      await this.mobileOptimization.provideCallFeedback('incoming');
      
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
        console.log('📞 Procesando oferta entrante...');
        
        // Establecer descripción remota
        await this.withTimeout(
          this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.incomingOffer)),
          5000,
          'Timeout al establecer descripción remota'
        );
        console.log('✅ Descripción remota establecida');

        // Crear respuesta
        const answer = await this.withTimeout(
          this.peerConnection.createAnswer(),
          5000,
          'Timeout al crear respuesta'
        );
        console.log('✅ Respuesta creada');

        // Establecer descripción local
        await this.withTimeout(
          this.peerConnection.setLocalDescription(answer),
          5000,
          'Timeout al establecer descripción local'
        );
        console.log('✅ Descripción local establecida');

        // Enviar respuesta al oferente
        this.socket.emit('answer', answer, this.roomId);
        console.log('📤 Respuesta enviada al oferente');

        // Marcar como listo ANTES de procesar candidatos
        this.isPeerConnectionReady = true;
        this.updateCallState({ isPeerConnectionReady: true });

        // Procesar candidatos pendientes con mejor manejo de errores
        console.log(`🔄 Procesando ${this.pendingCandidates.length} candidatos pendientes...`);
        for (const c of this.pendingCandidates) {
          try {
          await this.addIce(c);
            console.log('✅ Candidato pendiente procesado');
          } catch (error) {
            console.error('❌ Error procesando candidato pendiente:', error);
          }
        }
        this.pendingCandidates = [];
        
        this.updateCallState({ 
          callStatus: 'connected',
          isIncomingCall: false 
        });
        
        // Feedback táctil para llamada aceptada
        await this.mobileOptimization.provideCallFeedback('accepted');
        
        console.log('✅ Llamada aceptada exitosamente');
      } else {
        throw new Error('No hay oferta entrante o PeerConnection no disponible');
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
      if (!this.peerConnection) {
        console.warn('⚠️ PeerConnection no disponible para agregar ICE candidate');
        return;
      }
      
      if (this.peerConnection.remoteDescription === null) {
        console.warn('⚠️ RemoteDescription no establecida, guardando candidato como pendiente');
        this.pendingCandidates.push(candidate);
        return;
      }
      
      await this.peerConnection.addIceCandidate(candidate);
      console.log('✅ ICE candidate agregado exitosamente');
    } catch (err) {
      console.error('❌ Error agregando ICE candidate:', err);
      // No re-lanzar el error para evitar interrumpir el flujo
    }
  }

  endCall() {
    console.log('📞 Finalizando llamada...');
    
    // Feedback táctil para llamada terminada
    this.mobileOptimization.provideCallFeedback('ended');
    
    // Restaurar estado normal del dispositivo
    this.mobileOptimization.restoreNormalState();
    
    // Notificar al otro usuario que la llamada terminó
    if (this.socket && this.roomId) {
      this.socket.emit('call-ended', this.roomId);
    }
    
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
