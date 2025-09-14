// 🔧 Configuración de Entorno - Quiet Ring
// Este archivo contiene las URLs y configuraciones del backend

export const ENV_CONFIG = {
  // 🌐 Servidor API REST (Autenticación OTP)
  API: {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
      OTP_GENERATE: '/otp/generate',
      OTP_VALIDATE: '/otp/valid'
    }
  },

  // 📡 Servidor WebRTC (Socket.IO)
  WEBRTC: {
    SERVER_URL: 'http://144.202.33.14:8081',
    TRANSPORTS: ['websocket'],
    CREDENTIALS: true,
    STUN_SERVER: 'stun:stun.l.google.com:19302'
  },

  // 🏗️ Configuración de Desarrollo
  APP: {
    NAME: 'Quiet Ring',
    VERSION: '1.0.0',
    ID: 'io.ionic.starter',
    NODE_ENV: 'development',
    DEBUG_MODE: true
  },

  // 🔐 Configuración de Seguridad
  SECURITY: {
    ALLOW_CLEARTEXT_TRAFFIC: true,
    CORS_ORIGINS: '*'
  }
};

// 🎯 URLs Completas para fácil acceso
export const API_URLS = {
  OTP_GENERATE: `${ENV_CONFIG.API.BASE_URL}${ENV_CONFIG.API.ENDPOINTS.OTP_GENERATE}`,
  OTP_VALIDATE: `${ENV_CONFIG.API.BASE_URL}${ENV_CONFIG.API.ENDPOINTS.OTP_VALIDATE}`
};

// 📡 Configuración WebRTC
export const WEBRTC_CONFIG = {
  SERVER_URL: ENV_CONFIG.WEBRTC.SERVER_URL,
  OPTIONS: {
    transports: ENV_CONFIG.WEBRTC.TRANSPORTS,
    withCredentials: ENV_CONFIG.WEBRTC.CREDENTIALS
  },
  ICE_SERVERS: [
    { urls: ENV_CONFIG.WEBRTC.STUN_SERVER }
  ]
};
