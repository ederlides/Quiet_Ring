import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';

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

  localVideoElement: HTMLVideoElement | null = null;
  remoteVideoElement: HTMLVideoElement | null = null;

  constructor(private router: Router) {
    this.socket = io('https://app.quietring.us:3000');

    this.socket.on('offer', async offer => {
      this.incomingOffer = offer;
      this.isIncomingCall = true;
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
      }
    });

    this.socket.emit('join', this.roomId);
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream || null;
  }

  public enableCamera(enable: boolean) {
    if (!this.localStream) return;
    this.localStream.getVideoTracks().forEach(t => t.enabled = enable);
  }

  public enableMicrophone(enable: boolean) {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach(t => t.enabled = enable);
  }

  setVideoElements(local: HTMLVideoElement, remote: HTMLVideoElement) {
    this.localVideoElement = local;
    this.remoteVideoElement = remote;
  }

  // ---------------------------------------------------------------------
  // 🔧 FIX PRINCIPAL → UNA sola llamada a getUserMedia
  // ---------------------------------------------------------------------
  async initLocal() {
    try {
      // Detener stream previo
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => t.stop());
        this.localStream = null;
        await new Promise(r => setTimeout(r, 150));
      }

      // Detectar dispositivos
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableMicrophones = devices.filter(d => d.kind === 'audioinput');

      // 📌 Obtener audio + video simultáneamente (esto evita NotReadableError)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });

      if (this.localVideoElement) {
        this.localVideoElement.srcObject = this.localStream;
        this.localVideoElement.muted = true;
      }

      console.log("🎥 Video OK");
      console.log("🎤 Audio tracks:", this.localStream.getAudioTracks());

    } catch (err: any) {
      console.error("🛑 Error al inicializar:", err.name, err.message);

      if (err.name === "NotReadableError") {
        this.camera = "⚠️ Cámara o micrófono en uso por otra aplicación.";
      } else if (err.name === "NotAllowedError") {
        this.camera = "❌ Permiso denegado.";
      } else {
        this.camera = `Error: ${err.name} - ${err.message}`;
      }
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
        const stream =
          (this.remoteVideoElement.srcObject as MediaStream) || new MediaStream();
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
    await this.initLocal();
    await this.createPeerConnection();

    if (this.incomingOffer && this.peerConnection) {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(this.incomingOffer)
      );

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit('answer', answer, this.roomId);

      this.isPeerConnectionReady = true;

      for (const c of this.pendingCandidates) await this.addIce(c);
      this.pendingCandidates = [];
    }

    this.isIncomingCall = false;
  }

  async callPeer() {
    await this.initLocal();
    await this.createPeerConnection();

    if (this.peerConnection) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit('offer', offer, this.roomId);
      this.isPeerConnectionReady = true;
    }
  }

  async addIce(candidate: RTCIceCandidate) {
    try {
      await this.peerConnection?.addIceCandidate(candidate);
    } catch (err) {
      console.error("Error adding ICE", err);
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
