// 🔧 Configuración de Ejemplo - Quiet Ring
// Copia este archivo como config.ts y ajusta los valores según tu configuración

export const CONFIG_EXAMPLE = {
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

// 🌍 URLs de Producción (ejemplo)
export const PRODUCTION_CONFIG = {
  API: {
    BASE_URL: 'https://api.quietring.com',
    ENDPOINTS: {
      OTP_GENERATE: '/otp/generate',
      OTP_VALIDATE: '/otp/valid'
    }
  },
  WEBRTC: {
    SERVER_URL: 'https://webrtc.quietring.com:8081',
    TRANSPORTS: ['websocket'],
    CREDENTIALS: true,
    STUN_SERVER: 'stun:stun.l.google.com:19302'
  }
};
