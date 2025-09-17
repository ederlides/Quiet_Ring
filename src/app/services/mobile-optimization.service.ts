import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class MobileOptimizationService {

  constructor(private platform: Platform) {}

  /**
   * Aplica optimizaciones específicas para videollamadas en móviles
   */
  async optimizeForVideoCall(): Promise<void> {
    if (!this.platform.is('mobile')) {
      return;
    }

    console.log('📱 Aplicando optimizaciones para videollamadas móviles...');

    try {
      // 1. Configurar StatusBar para videollamadas
      await this.configureStatusBar();
      
      // 2. Configurar App para videollamadas
      await this.configureApp();
      
      // 3. Configurar Haptics para feedback
      await this.configureHaptics();
      
      console.log('✅ Optimizaciones móviles aplicadas exitosamente');
    } catch (error) {
      console.error('❌ Error aplicando optimizaciones móviles:', error);
    }
  }

  /**
   * Configura la StatusBar para videollamadas
   */
  private async configureStatusBar(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        await StatusBar.hide();
        console.log('📱 StatusBar configurada para videollamadas');
      } catch (error) {
        console.warn('⚠️ No se pudo configurar StatusBar:', error);
      }
    }
  }

  /**
   * Configura la App para videollamadas
   */
  private async configureApp(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        // Prevenir que la app se cierre durante videollamadas
        await App.addListener('backButton', (data) => {
          console.log('🔙 Botón atrás presionado durante videollamada');
          // Aquí puedes manejar la lógica de salida de la videollamada
        });

        // Manejar cuando la app entra en segundo plano
        await App.addListener('appStateChange', (state) => {
          console.log('📱 Estado de la app cambió:', state);
          if (state.isActive) {
            console.log('📱 App activa - videollamada en primer plano');
          } else {
            console.log('📱 App en segundo plano - videollamada en background');
          }
        });

        console.log('📱 App configurada para videollamadas');
      } catch (error) {
        console.warn('⚠️ No se pudo configurar App:', error);
      }
    }
  }

  /**
   * Configura Haptics para feedback táctil
   */
  private async configureHaptics(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        // Verificar si Haptics está disponible
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
          console.log('📱 Haptics disponible para feedback táctil');
        } catch (error) {
          console.warn('⚠️ Haptics no disponible:', error);
        }
      } catch (error) {
        console.warn('⚠️ Haptics no disponible:', error);
      }
    }
  }

  /**
   * Proporciona feedback táctil para eventos de videollamada
   */
  async provideCallFeedback(type: 'incoming' | 'accepted' | 'ended' | 'error'): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      switch (type) {
        case 'incoming':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'accepted':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'ended':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'error':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo proporcionar feedback táctil:', error);
    }
  }

  /**
   * Restaura la configuración normal después de la videollamada
   */
  async restoreNormalState(): Promise<void> {
    if (!this.platform.is('mobile')) {
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.show();
        await StatusBar.setStyle({ style: Style.Default });
        console.log('📱 Estado normal restaurado');
      }
    } catch (error) {
      console.error('❌ Error restaurando estado normal:', error);
    }
  }

  /**
   * Detecta si es un dispositivo móvil
   */
  isMobileDevice(): boolean {
    return this.platform.is('mobile') || this.platform.is('android') || this.platform.is('ios');
  }

  /**
   * Obtiene información del dispositivo
   */
  getDeviceInfo(): {
    platform: string;
    isNative: boolean;
    isMobile: boolean;
  } {
    return {
      platform: this.platform.platforms().join(', '),
      isNative: Capacitor.isNativePlatform(),
      isMobile: this.isMobileDevice()
    };
  }
}
