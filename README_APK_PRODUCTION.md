# 📱 Generación de APK de Producción - Quiet Ring

Este documento describe el proceso completo para generar el APK de producción de la aplicación Quiet Ring, incluyendo las mejoras implementadas y la configuración de variables de entorno.

## 🚀 Resumen de Mejoras Implementadas

### 1. **Scroll en Secciones del Menú**
- ✅ Agregado scroll funcional a todas las secciones del menú
- ✅ Solucionados problemas de desbordamiento de contenido
- ✅ Mejorada la experiencia de usuario en dispositivos con pantallas pequeñas

### 2. **Variables de Entorno Centralizadas**
- ✅ Migradas todas las URLs hardcodeadas a archivos de environment
- ✅ Configuración separada para desarrollo y producción
- ✅ Fácil mantenimiento y cambios de configuración

## 📋 Prerrequisitos

### Software Requerido
- **Node.js**: v18+ (recomendado v20+)
- **Java**: v21 (configurado correctamente)
- **Android SDK**: Instalado y configurado
- **Gradle**: v8.0+ (incluido en el proyecto)
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Capacitor CLI**: `npm install -g @capacitor/cli`

### Verificar Instalaciones
```bash
# Verificar Java
java -version
# Debe mostrar Java 21

# Verificar Node.js
node -v
# Debe mostrar v18+

# Verificar Ionic
ionic --version

# Verificar Capacitor
npx cap --version
```

## 🔧 Configuración de Variables de Entorno

### Archivo `src/environments/environment.ts` (Desarrollo)
```typescript
export const environment = {
  production: false,
  api: {
    baseUrl: 'http://144.202.16.218:8080/api-quiet-ring',
    socketUrl: 'https://app.quietring.us:3000',
    otp: {
      generate: 'http://144.202.16.218:8080/api-quiet-ring/otp/generate',
      validate: 'http://144.202.16.218:8080/api-quiet-ring/otp/validate'
    }
  },
  external: {
    flagCdn: 'https://flagcdn.com/w40',
    fonts: {
      google: 'https://fonts.googleapis.com',
      googleStatic: 'https://fonts.gstatic.com'
    }
  },
  app: {
    name: 'Quiet Ring',
    version: '1.0.0',
    activateUrl: 'https://quietring.com/activate'
  }
};
```

### Archivo `src/environments/environment.prod.ts` (Producción)
```typescript
export const environment = {
  production: true,
  api: {
    baseUrl: 'https://app.quietring.us:8443/api-quiet-ring',
    socketUrl: 'https://app.quietring.us:3000',
    otp: {
      generate: 'https://app.quietring.us:8443/api-quiet-ring/otp/generate',
      validate: 'https://app.quietring.us:8443/api-quiet-ring/otp/validate'
    }
  },
  external: {
    flagCdn: 'https://flagcdn.com/w40',
    fonts: {
      google: 'https://fonts.googleapis.com',
      googleStatic: 'https://fonts.gstatic.com'
    }
  },
  app: {
    name: 'Quiet Ring',
    version: '1.0.0',
    activateUrl: 'https://quietring.com/activate'
  }
};
```

## 🏗️ Proceso de Generación del APK

### Paso 1: Preparar el Entorno
```bash
# Navegar al directorio del proyecto
cd /home/joseph/Documentos/QuietRing/Quiet_Ring

# Instalar dependencias
npm install
```

### Paso 2: Verificar Configuración de Angular
El archivo `angular.json` debe contener la configuración de `fileReplacements`:

```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ],
      "outputHashing": "all"
    }
  }
}
```

### Paso 3: Construir la Aplicación Web
```bash
# Build de producción (usa environment.prod.ts automáticamente)
npm run build --configuration=production
```

**Verificación**: El build debe completarse sin errores y mostrar:
- ✔ Browser application bundle generation complete
- ✔ Copying assets complete
- ✔ Index html generation complete

### Paso 4: Sincronizar con Capacitor
```bash
# Sincronizar archivos web con Android
npx cap sync android
```

**Verificación**: Debe mostrar:
- ✔ Copying web assets from www to android/app/src/main/assets/public
- ✔ Creating capacitor.config.json in android/app/src/main/assets
- ✔ Sync finished successfully

### Paso 5: Generar APK de Producción
```bash
# Navegar al directorio Android
cd android

# Dar permisos de ejecución a gradlew (solo la primera vez)
chmod +x gradlew

# Generar APK de producción
./gradlew assembleRelease
```

**Verificación**: El build debe mostrar:
- BUILD SUCCESSFUL
- APK generado en: `android/app/build/outputs/apk/release/`

## 📁 Ubicación del APK Generado

```
android/app/build/outputs/apk/release/
├── app-release-unsigned.apk    # APK sin firmar
└── output.json                 # Metadatos del build
```

## 🔍 Verificación de la Configuración

### Verificar URLs de Producción en el APK
```bash
# Buscar URLs de producción en el código compilado
grep -r "app.quietring.us:8443" www/ || echo "URLs de producción encontradas"
```

### Verificar Variables de Entorno
```bash
# Verificar que el build use las variables correctas
grep -r "production.*true" www/
```

## 🛠️ Solución de Problemas

### Error: "Java version not found"
```bash
# Verificar JAVA_HOME
echo $JAVA_HOME
# Debe apuntar a Java 21

# Configurar JAVA_HOME si es necesario
export JAVA_HOME=/path/to/java21
```

### Error: "Gradle permission denied"
```bash
# Dar permisos de ejecución
chmod +x gradlew
```

### Error: "Build failed"
```bash
# Limpiar build anterior
./gradlew clean

# Reintentar build
./gradlew assembleRelease
```

### Error: "Environment variables not found"
```bash
# Verificar que los archivos de environment existan
ls -la src/environments/

# Verificar configuración de angular.json
grep -A 5 "fileReplacements" angular.json
```

## 📊 Características del APK Generado

### ✅ Funcionalidades Implementadas
- **Scroll mejorado**: Todas las secciones del menú tienen scroll funcional
- **Variables de entorno**: URLs centralizadas y configurables
- **Permisos de audio**: Configurados para llamadas de voz
- **Optimización**: Build optimizado para producción
- **Compatibilidad**: Compatible con Java 21

### 🔧 Configuración Técnica
- **Tipo**: APK de producción (Release)
- **Firmado**: No firmado (requiere firma para distribución)
- **Optimización**: Habilitada
- **Minificación**: Habilitada
- **Tree Shaking**: Habilitado

## 🚀 Próximos Pasos

### Para Distribución
1. **Firmar el APK** (requerido para Google Play Store)
2. **Probar en dispositivos reales**
3. **Verificar funcionalidades de audio y cámara**
4. **Validar conectividad con APIs de producción**

### Para Desarrollo
1. **Usar `npm run build`** para builds de desarrollo
2. **Usar `npm run build --configuration=production`** para builds de producción
3. **Modificar URLs en `environment.ts` o `environment.prod.ts`** según sea necesario

## 📝 Notas Importantes

- **Variables de entorno**: Siempre usar las variables de environment en lugar de URLs hardcodeadas
- **Build de producción**: Siempre usar `--configuration=production` para builds de producción
- **Sincronización**: Ejecutar `npx cap sync android` después de cada build
- **Permisos**: El APK incluye todos los permisos necesarios para audio y cámara

## 🎯 URLs de Producción Configuradas

- **API Base**: `https://app.quietring.us:8443/api-quiet-ring`
- **Socket**: `https://app.quietring.us:3000`
- **OTP Generate**: `https://app.quietring.us:8443/api-quiet-ring/otp/generate`
- **OTP Validate**: `https://app.quietring.us:8443/api-quiet-ring/otp/validate`
- **Flag CDN**: `https://flagcdn.com/w40`
- **Activate URL**: `https://quietring.com/activate`

---

**Fecha de Generación**: $(date)  
**Versión**: 1.0.0  
**Estado**: ✅ APK de Producción Generado Exitosamente
