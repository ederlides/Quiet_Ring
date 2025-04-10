import { ElementRef, Injectable } from '@angular/core';
import {io} from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private peerConnection: RTCPeerConnection;
  private socket = io('http://144.202.33.14:8081', {
    transports: ['websocket'], // 🔥 Evita "polling", usa solo WebSocket
    withCredentials: true, // 🔥 Permite credenciales (si es necesario)
  });
  private localStream: MediaStream ;
  remoteVideo!: ElementRef<HTMLVideoElement>;

  constructor() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
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
