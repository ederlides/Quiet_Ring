# 📱 Documentación: Proceso de Firma de APK - Quiet Ring

## 📋 Índice
1. [Introducción](#introducción)
2. [Prerrequisitos](#prerrequisitos)
3. [Proceso de Firma](#proceso-de-firma)
4. [Configuración de Gradle](#configuración-de-gradle)
5. [Generación del APK Firmado](#generación-del-apk-firmado)
6. [Verificación de Firma](#verificación-de-firma)
7. [Troubleshooting](#troubleshooting)
8. [Archivos Generados](#archivos-generados)

## 🎯 Introducción

Este documento describe el proceso completo para firmar un APK de Android en el proyecto Quiet Ring, permitiendo que sea instalable en dispositivos Android. Un APK sin firmar no puede ser instalado en dispositivos reales.

## ⚙️ Prerrequisitos

- **Java 21** instalado y configurado
- **Android SDK** instalado
- **Gradle** configurado
- **Node.js** y **npm** para el proyecto Ionic
- **keytool** (incluido con Java)

### Verificar Prerrequisitos
```bash
java -version
# Debe mostrar Java 21

keytool -help
# Debe mostrar la ayuda de keytool

./gradlew --version
# Debe mostrar la versión de Gradle
```

## 🔐 Proceso de Firma

### Paso 1: Crear Directorio de Keystore
```bash
cd /home/joseph/Documentos/QuietRing/Quiet_Ring
mkdir -p android/app/keystore
```

### Paso 2: Generar Certificado de Firma
```bash
keytool -genkey -v -keystore android/app/keystore/quietring-release-key.keystore \
  -alias quietring \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass quietring123 \
  -keypass quietring123 \
  -dname "CN=QuietRing, OU=Development, O=QuietRing, L=City, S=State, C=CO"
```

**Parámetros explicados:**
- `-keystore`: Ruta del archivo keystore
- `-alias`: Alias del certificado
- `-keyalg`: Algoritmo de clave (RSA)
- `-keysize`: Tamaño de la clave (2048 bits)
- `-validity`: Validez en días (10000 = ~27 años)
- `-storepass`: Contraseña del keystore
- `-keypass`: Contraseña de la clave
- `-dname`: Información del certificado

### Paso 3: Crear Archivo de Propiedades de Firma
Crear el archivo `android/app/signing.properties`:
```properties
storeFile=keystore/quietring-release-key.keystore
storePassword=quietring123
keyAlias=quietring
keyPassword=quietring123
```

## 🔧 Configuración de Gradle

### Modificar `android/app/build.gradle`

Agregar al inicio del archivo (después de `apply plugin: 'com.android.application'`):
```gradle
// Cargar propiedades de firma
def keystorePropertiesFile = rootProject.file("app/signing.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Agregar configuración de firma dentro del bloque `android`:
```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}
```

Modificar el bloque `buildTypes`:
```gradle
buildTypes {
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        if (keystorePropertiesFile.exists()) {
            signingConfig signingConfigs.release
        }
    }
}
```

## 🚀 Generación del APK Firmado

### Paso 1: Limpiar el Proyecto
```bash
cd android
./gradlew clean
```

### Paso 2: Generar APK Firmado
```bash
./gradlew assembleRelease
```

### Paso 3: Verificar Generación
```bash
ls -la app/build/outputs/apk/release/
```

**Archivos esperados:**
- `app-release.apk` (APK firmado)
- `output-metadata.json` (metadatos)

## ✅ Verificación de Firma

### Verificar que el APK esté firmado
```bash
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk
```

**Salida esperada:**
- Múltiples entradas con `s = signature was verified`
- Información del certificado: `CN=QuietRing, OU=Development, O=QuietRing`
- Warnings sobre certificado autofirmado (normales)

### Verificar información del APK
```bash
aapt dump badging app/build/outputs/apk/release/app-release.apk
```

## 🔍 Troubleshooting

### Error: "Keystore file not found"
**Problema**: Gradle no encuentra el archivo keystore
**Solución**: Verificar la ruta en `signing.properties`
```properties
# Correcto
storeFile=keystore/quietring-release-key.keystore

# Incorrecto
storeFile=../keystore/quietring-release-key.keystore
```

### Error: "Permission denied for gradlew"
**Problema**: El script gradlew no tiene permisos de ejecución
**Solución**:
```bash
chmod +x gradlew
```

### Error: "Keystore was tampered with"
**Problema**: El keystore está corrupto o la contraseña es incorrecta
**Solución**: Regenerar el keystore con el comando del Paso 2

### Error: "APK not installed - invalid"
**Problema**: El APK no está firmado
**Solución**: Verificar que el proceso de firma se completó correctamente

## 📁 Archivos Generados

### Estructura de Archivos
```
android/
├── app/
│   ├── keystore/
│   │   └── quietring-release-key.keystore
│   ├── signing.properties
│   ├── build.gradle (modificado)
│   └── build/
│       └── outputs/
│           └── apk/
│               └── release/
│                   ├── app-release.apk
│                   └── output-metadata.json
```

### Archivos Importantes
- **`quietring-release-key.keystore`**: Certificado de firma (¡MANTENER SEGURO!)
- **`signing.properties`**: Configuración de firma
- **`app-release.apk`**: APK firmado listo para instalar

## 🔒 Seguridad

### ⚠️ Importante
- **NUNCA** compartir el archivo `.keystore`
- **NUNCA** subir `signing.properties` al control de versiones
- **RESPALDAR** el keystore en lugar seguro
- **USAR** contraseñas seguras en producción

### Agregar a .gitignore
```gitignore
# Archivos de firma
android/app/keystore/
android/app/signing.properties
```

## 📱 Instalación del APK

### En Dispositivo Android
1. Transferir `app-release.apk` al dispositivo
2. Habilitar "Fuentes desconocidas" en Configuración > Seguridad
3. Instalar el APK
4. Permitir permisos solicitados

### Verificar Instalación
- La app debe aparecer en el menú de aplicaciones
- Debe solicitar permisos de audio y cámara
- Debe conectarse a las URLs de producción configuradas

## 🔄 Proceso Completo Resumido

```bash
# 1. Crear keystore
mkdir -p android/app/keystore
keytool -genkey -v -keystore android/app/keystore/quietring-release-key.keystore \
  -alias quietring -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass quietring123 -keypass quietring123 \
  -dname "CN=QuietRing, OU=Development, O=QuietRing, L=City, S=State, C=CO"

# 2. Crear signing.properties
echo "storeFile=keystore/quietring-release-key.keystore
storePassword=quietring123
keyAlias=quietring
keyPassword=quietring123" > android/app/signing.properties

# 3. Generar APK firmado
cd android
./gradlew clean
./gradlew assembleRelease

# 4. Verificar firma
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk
```

## 📞 Soporte

Si encuentras problemas durante el proceso de firma:

1. Verificar que todos los prerrequisitos estén instalados
2. Revisar los logs de Gradle para errores específicos
3. Verificar que las rutas en `signing.properties` sean correctas
4. Asegurar que el keystore no esté corrupto

---

**Fecha de creación**: 16 de septiembre de 2025  
**Versión del documento**: 1.0  
**Proyecto**: Quiet Ring - Aplicación de Llamadas de Voz
