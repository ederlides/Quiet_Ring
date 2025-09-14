export const environment = {
  production: true,
  
  // 🌐 API Configuration (Producción)
  apiUrl: 'http://144.202.33.14:8080', // URL real de producción
  apiEndpoints: {
    otpGenerate: '/otp/generate',
    otpValidate: '/otp/valid'
  },
  
  // 📡 WebRTC Configuration (Producción)
  webrtc: {
    serverUrl: 'http://144.202.33.14:8081', // URL real de producción
    transports: ['websocket'],
    credentials: true,
    stunServer: 'stun:stun.l.google.com:19302'
  },
  
  // 🏗️ App Configuration
  app: {
    name: 'Quiet Ring',
    version: '1.0.0',
    debugMode: false
  }
};
