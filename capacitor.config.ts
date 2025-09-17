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
    // 🎧 Configuración optimizada para videollamadas
    Permissions: {
      audio: {
        microphone: true,
        modifyAudioSettings: true,
        bluetooth: true,
        bluetoothAdmin: true,
        bluetoothConnect: true
      },
      camera: {
        capture: true,
        recordVideo: true
      },
      phone: {
        callPhone: true
      }
    },
    // 📱 Configuración para notificaciones y llamadas
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    // 🎥 Configuración específica para WebRTC
    Camera: {
      permissions: ["camera", "microphone"]
    },
    // 🔊 Configuración de audio nativo
    NativeAudio: {
      fade: true,
      focus: true,
      mixWithOthers: false
    }
  },
  // 🔧 Configuración optimizada para Android
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // 🎥 Optimizaciones para videollamadas
    hardwareAccelerated: true,
    // 🔊 Configuración de audio
    audioFocus: true,
    // 📱 Configuración de pantalla
    orientation: "portrait",
    // 🔋 Optimizaciones de batería
    backgroundMode: "audio"
  },
  // 📱 Configuración para iOS
  ios: {
    // 🎥 Optimizaciones para videollamadas
    hardwareAccelerated: true,
    // 🔊 Configuración de audio
    audioSessionCategory: "playAndRecord",
    audioSessionMode: "videoChat",
    // 📱 Configuración de pantalla
    orientation: "portrait"
  }
};

export default config;
