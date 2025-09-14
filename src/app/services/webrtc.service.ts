import { ElementRef, Injectable } from '@angular/core';
import {io} from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private peerConnection: RTCPeerConnection;
  private socket = io(environment.webrtc.serverUrl, {
    transports: environment.webrtc.transports,
    withCredentials: environment.webrtc.credentials,
  });
  private localStream: MediaStream ;
  remoteVideo!: ElementRef<HTMLVideoElement>;

  constructor() {
    console.log('📡 WebRTC Server URL:', environment.webrtc.serverUrl);
    console.log('🧊 STUN Server:', environment.webrtc.stunServer);
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: environment.webrtc.stunServer }]
    });

    // Manejar llegada de pistas de video/audio
    this.peerConnection.ontrack = (event) => {
      console.log('📡 Stream remoto recibido:', event.streams);
      if (event.streams.length > 0) {
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      }
    };

    // Enviar ICE Candidates al servidor
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('❄️ Enviando ICE Candidate:', event.candidate);
        this.socket.emit('candidate', event.candidate);
      }
    };

    // Recibir y procesar señales del servidor
    this.socket.on('offer', async (offer) => {
      console.log('📡 Oferta recibida:', offer);
      await this.receiveCall(offer);
    });

    this.socket.on('answer', async (answer) => {
      console.log('✅ Respuesta recibida:', answer);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    this.socket.on('candidate', async (candidate) => {
      console.log('❄️ ICE Candidate recibido:', candidate);
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      
    });
  }

  // 🔹 Iniciar Stream Local
  async startLocalStream(): Promise<MediaStream | null> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
      return this.localStream;
    } catch (error) {
      console.error('❌ Error al obtener el stream local:', error);
      return null;
    }
  }

  // 🔹 Iniciar Llamada
  async startCall() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('📡 Enviando oferta:', offer);
    this.socket.emit('offer', offer);
  }

  // 🔹 Responder una Llamada
  async receiveCall(offer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    console.log('✅ Enviando respuesta:', answer);
    this.socket.emit('answer', answer);
  }
}
