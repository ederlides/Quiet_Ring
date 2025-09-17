import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WebrtcService } from '../services/webrtc.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CallState, WebSocketState } from '../interfaces/call-state.interface';

@Component({
  selector: 'app-calling',
  templateUrl: './calling.component.html',
  styleUrls: ['./calling.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CallingComponent implements OnInit, OnDestroy {
  constructor(public webrtc: WebrtcService, private router: Router) { }

  calling: boolean = true;
  @ViewChild('slider', { static: false }) slider: ElementRef;
  @ViewChild('slideContainer', { static: false }) slideContainer: ElementRef;

  // Estados observables
  callState$: Observable<CallState>;
  webSocketState$: Observable<WebSocketState>;
  
  // Estados locales
  callState: CallState;
  webSocketState: WebSocketState;
  
  // Subscripciones
  private subscriptions: Subscription[] = [];

  private sliding = false;


  ngOnInit() {
    // Suscribirse a los estados
    this.callState$ = this.webrtc.getCallState$();
    this.webSocketState$ = this.webrtc.getWebSocketState$();
    
    // Suscribirse a cambios de estado
    this.subscriptions.push(
      this.callState$.subscribe(state => {
        this.callState = state;
        this.handleCallStateChange(state);
      })
    );
    
    this.subscriptions.push(
      this.webSocketState$.subscribe(state => {
        this.webSocketState = state;
        this.handleWebSocketStateChange(state);
      })
    );
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private handleCallStateChange(state: CallState) {
    console.log('📞 Estado de llamada cambiado:', state);
    
    if (state.error) {
      console.error('❌ Error en llamada:', state.error);
      // Aquí podrías mostrar un toast o alert con el error
    }
    
    if (state.callStatus === 'connected') {
      console.log('✅ Llamada conectada');
    } else if (state.callStatus === 'ended') {
      console.log('📞 Llamada finalizada');
      this.router.navigate(['/menu']);
    }
  }

  private handleWebSocketStateChange(state: WebSocketState) {
    console.log('🔌 Estado WebSocket cambiado:', state);
    
    if (!state.isConnected && !state.isConnecting) {
      console.error('❌ WebSocket desconectado');
      // Aquí podrías mostrar un indicador de conexión perdida
    }
  }

  getCallStatusText(status: string): string {
    switch (status) {
      case 'idle': return 'Inactivo';
      case 'calling': return 'Llamando...';
      case 'ringing': return 'Sonando...';
      case 'connected': return 'Conectado';
      case 'ended': return 'Finalizada';
      default: return 'Desconocido';
    }
  }

  getCallStatusColor(status: string): string {
    switch (status) {
      case 'idle': return 'medium';
      case 'calling': return 'warning';
      case 'ringing': return 'primary';
      case 'connected': return 'success';
      case 'ended': return 'dark';
      default: return 'medium';
    }
  }

  startSlide(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.sliding = true;

    const moveListener = (e: any) => this.moveSlide(e);
    const upListener = () => this.endSlide(moveListener, upListener);

    document.addEventListener('mousemove', moveListener);
    document.addEventListener('mouseup', upListener);
    document.addEventListener('touchmove', moveListener);
    document.addEventListener('touchend', upListener);
  }

  moveSlide(event: MouseEvent | TouchEvent) {
    if (!this.sliding) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const container = this.slideContainer.nativeElement;
    const slider = this.slider.nativeElement;

    const containerRect = container.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - containerRect.left - slider.offsetWidth / 2), containerRect.width - slider.offsetWidth);

    slider.style.left = `${x}px`;
  }

  endSlide(moveListener, upListener) {
    const container = this.slideContainer.nativeElement;
    const slider = this.slider.nativeElement;
    const containerRect = container.getBoundingClientRect();

    const finalLeft = parseInt(slider.style.left || '0', 10);
    if (finalLeft + slider.offsetWidth >= containerRect.width - 10) {
      this.router.navigate(['/pip']);
    }

    // Reset slider
    slider.style.left = '0px';
    this.sliding = false;

    document.removeEventListener('mousemove', moveListener);
    document.removeEventListener('mouseup', upListener);
    document.removeEventListener('touchmove', moveListener);
    document.removeEventListener('touchend', upListener);
  }

  /**
   * Obtiene el estado del audio
   */
  getAudioStatus() {
    return this.webrtc.getAudioStatus();
  }

  /**
   * Verifica si el audio está transmitiendo
   */
  isAudioTransmitting() {
    return this.webrtc.isAudioTransmitting();
  }

  /**
   * Alterna el estado del audio
   */
  toggleAudio() {
    const currentStatus = this.getAudioStatus();
    this.webrtc.toggleAudio(!currentStatus.audioEnabled);
  }

}
