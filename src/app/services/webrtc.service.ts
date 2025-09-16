import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { PermissionsService } from './permissions.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  public camera: any;
  private socket: Socket;
  private roomId = localStorage.getItem('room');

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  availableMicrophones: MediaDeviceInfo[] = [];
  private rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

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
    this.socket = io(environment.api.socketUrl);

    this.socket.on('offer', async offer => {
      this.incomingOffer = offer;
      this.isIncomingCall = true;
      this.router.navigate(['/call']); // Redirige al componente receptor
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
      }
    });

    this.socket.emit('join', this.roomId);
  }

  setVideoElements(local: HTMLVideoElement, remote: HTMLVideoElement) {
    this.localVideoElement = local;
    this.remoteVideoElement = remote;
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
      
      // 🔐 Verificar permisos antes de aceptar la llamada
      const permissionCheck = await this.verifyCallPermissions();
      if (!permissionCheck.success) {
        console.warn('⚠️ Permisos faltantes, solicitando...');
        const permissionRequest = await this.requestCallPermissions();
        if (!permissionRequest.success) {
          throw new Error(`No se pueden aceptar llamadas: ${permissionRequest.message}`);
        }
      }

      await this.initLocal();
      await this.createPeerConnection();

      if (this.incomingOffer && this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.incomingOffer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', answer, this.roomId);

        this.isPeerConnectionReady = true;

        for (const c of this.pendingCandidates) {
          await this.addIce(c);
        }
        this.pendingCandidates = [];
        
        console.log('✅ Llamada aceptada exitosamente');
      }
      this.isIncomingCall = false;
    } catch (error) {
      console.error('❌ Error al aceptar llamada:', error);
      this.isIncomingCall = false;
      throw error;
    }
  }

  async callPeer() {
    try {
      console.log('📞 Iniciando llamada saliente...');
      
      // 🔐 Verificar permisos antes de iniciar la llamada
      const permissionCheck = await this.verifyCallPermissions();
      if (!permissionCheck.success) {
        console.warn('⚠️ Permisos faltantes, solicitando...');
        const permissionRequest = await this.requestCallPermissions();
        if (!permissionRequest.success) {
          throw new Error(`No se pueden realizar llamadas: ${permissionRequest.message}`);
        }
      }

      await this.initLocal();
      await this.createPeerConnection();

      if (this.peerConnection) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.socket.emit('offer', offer, this.roomId);
        this.isPeerConnectionReady = true;
        
        console.log('✅ Llamada iniciada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al iniciar llamada:', error);
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

    this.isIncomingCall = false;
    this.isPeerConnectionReady = false;
    this.pendingCandidates = [];
  }
}
