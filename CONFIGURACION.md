# 🔧 Configuración de Entorno - Quiet Ring

Este documento explica cómo configurar las URLs del backend de forma global y flexible.

## 📁 Archivos de Configuración

### 1. **environment.config.ts** (Configuración Global)
```typescript
// Configuración centralizada con todas las URLs
export const ENV_CONFIG = {
  API: {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
      OTP_GENERATE: '/otp/generate',
      OTP_VALIDATE: '/otp/valid'
    }
  },
  WEBRTC: {
    SERVER_URL: 'http://144.202.33.14:8081',
    TRANSPORTS: ['websocket'],
    CREDENTIALS: true,
    STUN_SERVER: 'stun:stun.l.google.com:19302'
  }
};
```

### 2. **src/environments/environment.ts** (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  webrtc: {
    serverUrl: 'http://144.202.33.14:8081',
    stunServer: 'stun:stun.l.google.com:19302'
  }
};
```

### 3. **src/environments/environment.prod.ts** (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.quietring.com',
  webrtc: {
    serverUrl: 'https://webrtc.quietring.com:8081',
    stunServer: 'stun:stun.l.google.com:19302'
  }
};
```

## 🔄 Cambios Realizados

### ✅ **API Service Actualizado**
```typescript
// Antes (hardcodeado)
let url = 'http://localhost:8080/otp/generate';

// Ahora (usando environment)
const url = `${environment.apiUrl}${environment.apiEndpoints.otpGenerate}`;
```

### ✅ **WebRTC Service Actualizado**
```typescript
// Antes (hardcodeado)
private socket = io('http://144.202.33.14:8081', {
  transports: ['websocket'],
  withCredentials: true,
});

// Ahora (usando environment)
private socket = io(environment.webrtc.serverUrl, {
  transports: environment.webrtc.transports,
  withCredentials: environment.webrtc.credentials,
});
```

## 🚀 Cómo Usar

### **Para Desarrollo:**
```bash
# Usar configuración de desarrollo (environment.ts)
npm run start
```

### **Para Producción:**
```bash
# Usar configuración de producción (environment.prod.ts)
npm run build --configuration production
```

## 🔧 Personalizar URLs

### **Cambiar Servidor API:**
1. Edita `src/environments/environment.ts` para desarrollo
2. Edita `src/environments/environment.prod.ts` para producción

```typescript
// En environment.ts
apiUrl: 'http://tu-servidor-api:8080'

// En environment.prod.ts  
apiUrl: 'https://api.tu-dominio.com'
```

### **Cambiar Servidor WebRTC:**
```typescript
// En environment.ts
webrtc: {
  serverUrl: 'http://tu-servidor-webrtc:8081'
}

// En environment.prod.ts
webrtc: {
  serverUrl: 'https://webrtc.tu-dominio.com:8081'
}
```

## 📊 URLs Actuales Configuradas

| Servicio | Desarrollo | Producción |
|----------|------------|------------|
| **API REST** | `http://localhost:8080` | `https://api.quietring.com` |
| **WebRTC** | `http://144.202.33.14:8081` | `https://webrtc.quietring.com:8081` |
| **STUN** | `stun:stun.l.google.com:19302` | `stun:stun.l.google.com:19302` |

## ⚠️ Notas Importantes

1. **Cambiar URLs de Producción:** Actualiza las URLs en `environment.prod.ts` antes del deploy
2. **HTTPS en Producción:** Usa siempre HTTPS en producción
3. **CORS:** Configura CORS en tus servidores para permitir las conexiones
4. **Variables de Entorno:** Considera usar variables de entorno del sistema para mayor seguridad

## 🔒 Seguridad

Para mayor seguridad, puedes usar variables de entorno del sistema:

```typescript
// En environment.prod.ts
apiUrl: process.env['API_URL'] || 'https://api.quietring.com',
webrtc: {
  serverUrl: process.env['WEBRTC_URL'] || 'https://webrtc.quietring.com:8081'
}
```

---
**✅ Configuración completada. Las URLs ahora son flexibles y fáciles de cambiar.**
