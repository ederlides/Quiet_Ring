import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

declare var cordova: any;

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private androidPermissions: any;

  constructor(private platform: Platform) {
    if (this.platform.is('android') && cordova && cordova.plugins && cordova.plugins.permissions) {
      this.androidPermissions = cordova.plugins.permissions;
    }
  }

  /**
   * Verifica si la aplicación tiene permisos de audio
   */
  async checkAudioPermissions(): Promise<boolean> {
    if (!this.platform.is('android') || !this.androidPermissions) {
      return true; // En web siempre retornamos true
    }

    try {
      const result = await this.checkPermission('android.permission.RECORD_AUDIO');
      return result.hasPermission;
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      return false;
    }
  }

  /**
   * Solicita todos los permisos necesarios para llamadas de audio
   */
  async requestAudioPermissions(): Promise<boolean> {
    if (!this.platform.is('android') || !this.androidPermissions) {
      return true; // En web siempre retornamos true
    }

    const requiredPermissions = [
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE'
    ];

    try {
      console.log('🎧 Solicitando permisos de audio...');
      
      // Verificar permisos faltantes
      const missingPermissions: string[] = [];
      for (const permission of requiredPermissions) {
        const result = await this.checkPermission(permission);
        if (!result.hasPermission) {
          missingPermissions.push(permission);
        }
      }

      if (missingPermissions.length === 0) {
        console.log('✅ Todos los permisos ya están concedidos');
        return true;
      }

      console.log('📋 Permisos faltantes:', missingPermissions);

      // Solicitar permisos faltantes
      const requestResult = await this.requestPermissions(missingPermissions);
      
      if (requestResult.hasPermission) {
        console.log('✅ Permisos de audio concedidos exitosamente');
        return true;
      } else {
        console.log('❌ Permisos de audio denegados');
        return false;
      }
    } catch (error) {
      console.error('🛑 Error solicitando permisos de audio:', error);
      return false;
    }
  }

  /**
   * Verifica un permiso específico
   */
  private async checkPermission(permission: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.androidPermissions.checkPermission(
        permission,
        (result: any) => resolve(result),
        (error: any) => reject(error)
      );
    });
  }

  /**
   * Solicita una lista de permisos
   */
  private async requestPermissions(permissions: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.androidPermissions.requestPermissions(
        permissions,
        (result: any) => resolve(result),
        (error: any) => reject(error)
      );
    });
  }

  /**
   * Verifica si la aplicación puede acceder al micrófono
   */
  async canAccessMicrophone(): Promise<boolean> {
    if (!this.platform.is('android')) {
      // En web, verificar usando navigator.mediaDevices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'audioinput');
      } catch (error) {
        console.error('Error checking microphone access:', error);
        return false;
      }
    }

    return await this.checkAudioPermissions();
  }

  /**
   * Solicita acceso al micrófono con manejo de errores mejorado
   */
  async requestMicrophoneAccess(): Promise<boolean> {
    try {
      // Primero verificar permisos nativos en Android
      if (this.platform.is('android')) {
        const hasPermissions = await this.requestAudioPermissions();
        if (!hasPermissions) {
          return false;
        }
      }

      // Luego verificar acceso al micrófono
      const canAccess = await this.canAccessMicrophone();
      if (!canAccess) {
        console.error('❌ No se puede acceder al micrófono');
        return false;
      }

      // Intentar obtener un stream de prueba
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Limpiar stream de prueba
        console.log('✅ Acceso al micrófono verificado exitosamente');
        return true;
      } catch (error: any) {
        console.error('❌ Error al acceder al micrófono:', error.name, error.message);
        
        if (error.name === 'NotAllowedError') {
          console.error('🔒 Permiso denegado para acceder al micrófono');
        } else if (error.name === 'NotFoundError') {
          console.error('🎤 No se encontró micrófono en el dispositivo');
        } else if (error.name === 'NotReadableError') {
          console.error('⚠️ Micrófono en uso por otra aplicación');
        }
        
        return false;
      }
    } catch (error) {
      console.error('🛑 Error en requestMicrophoneAccess:', error);
      return false;
    }
  }

  /**
   * Verifica permisos de cámara
   */
  async checkCameraPermissions(): Promise<boolean> {
    if (!this.platform.is('android') || !this.androidPermissions) {
      return true;
    }

    try {
      const result = await this.checkPermission('android.permission.CAMERA');
      return result.hasPermission;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  }

  /**
   * Solicita permisos de cámara
   */
  async requestCameraPermissions(): Promise<boolean> {
    if (!this.platform.is('android') || !this.androidPermissions) {
      return true;
    }

    try {
      const result = await this.requestPermissions(['android.permission.CAMERA']);
      return result.hasPermission;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Verifica todos los permisos necesarios para llamadas de video
   */
  async checkAllCallPermissions(): Promise<{
    audio: boolean;
    camera: boolean;
    allGranted: boolean;
  }> {
    const audio = await this.checkAudioPermissions();
    const camera = await this.checkCameraPermissions();
    
    return {
      audio,
      camera,
      allGranted: audio && camera
    };
  }

  /**
   * Solicita todos los permisos necesarios para llamadas
   */
  async requestAllCallPermissions(): Promise<{
    audio: boolean;
    camera: boolean;
    allGranted: boolean;
  }> {
    const audio = await this.requestAudioPermissions();
    const camera = await this.requestCameraPermissions();
    
    return {
      audio,
      camera,
      allGranted: audio && camera
    };
  }
}
