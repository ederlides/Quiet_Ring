import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Quiet_Ring',
  webDir: 'www',
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  },
  plugins: {
    Keyboard: {
      resize: "body" // o "ionic"
    },
    // 🎧 Configuración para permisos de audio y llamadas
    Permissions: {
      audio: {
        microphone: true,
        modifyAudioSettings: true
      },
      camera: {
        capture: true
      }
    },
    // 📱 Configuración para notificaciones y llamadas
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  },
  // 🔧 Configuración adicional para Android
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
