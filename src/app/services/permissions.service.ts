import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor() { }

  /**
   * 🔐 Verificar y solicitar permisos de cámara y micrófono
   */
  async requestCameraAndAudioPermissions(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // En plataformas nativas, solicitamos permisos usando getUserMedia
        console.log('🔐 Solicitando permisos en plataforma nativa...');
        
        // Solicitar permisos de video y audio juntos
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Detener el stream inmediatamente después de obtener permisos
        stream.getTracks().forEach(track => track.stop());
        
        console.log('✅ Permisos de cámara y audio concedidos');
        return true;
        
      } else {
        // En web, verificamos si getUserMedia está disponible
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          console.log('🌐 Verificando disponibilidad de getUserMedia en web...');
          return true;
        } else {
          console.warn('⚠️ getUserMedia no está disponible en este navegador');
          return false;
        }
      }
    } catch (error: any) {
      console.error('❌ Error solicitando permisos:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error('🚫 Permisos denegados por el usuario');
      } else if (error.name === 'NotFoundError') {
        console.error('📷 Dispositivo de cámara/micrófono no encontrado');
      } else if (error.name === 'NotReadableError') {
        console.error('🔒 Dispositivo ya está en uso por otra aplicación');
      } else if (error.name === 'OverconstrainedError') {
        console.error('⚙️ Restricciones de medios no se pueden cumplir');
      } else if (error.name === 'NotSupportedError') {
        console.error('🚫 Navegador no soporta getUserMedia');
      }
      
      return false;
    }
  }

  /**
   * 🎤 Verificar si los permisos están disponibles
   */
  async checkPermissionsAvailable(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // En plataformas nativas, verificamos si getUserMedia está disponible
        return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
      } else {
        // En web, verificamos si el navegador soporta getUserMedia
        return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
      }
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de permisos:', error);
      return false;
    }
  }

  /**
   * 📱 Obtener información del dispositivo
   */
  getDeviceInfo(): { platform: string; isNative: boolean } {
    return {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform()
    };
  }
}