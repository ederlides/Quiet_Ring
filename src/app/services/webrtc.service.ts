import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private socket: Socket;
  private roomId = localStorage.getItem('room');

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;

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

  constructor(private router: Router) {
    this.socket = io('http://localhost:3000');

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

  async initLocal() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (this.localVideoElement) {
      this.localVideoElement.srcObject = this.localStream;
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
