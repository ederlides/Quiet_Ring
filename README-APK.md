# 📱 Generación de APK - Quiet Ring

Esta guía te explica cómo generar el instalador de Android (APK) para el proyecto Quiet Ring desde cero.

## 📋 Prerrequisitos

### 1. Node.js y NPM
```bash
# Verificar versiones instaladas
node --version  # Debe ser v18+ (recomendado v22+)
npm --version   # Debe ser v8+
```

### 2. Java Development Kit (JDK)
```bash
# Verificar Java instalado
java -version
```

**Requerido:** Java 21 (LTS)
```bash
# Instalar Java 21 usando SDKMAN (recomendado)
curl -s "https://get.sdkman.io" | bash
source "/home/$USER/.sdkman/bin/sdkman-init.sh"
sdk install java 21.0.8-tem
sdk use java 21.0.8-tem
```

### 3. Android SDK
```bash
# Verificar si Android SDK está instalado
echo $ANDROID_HOME
adb version
```

**Si no está instalado:**
```bash
# Opción 1: Android Studio (recomendado)
sudo snap install android-studio --classic

# Opción 2: Solo SDK Command Line Tools
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools tools
```

## 🚀 Proceso de Generación del APK

### Paso 1: Configurar Variables de Entorno
```bash
# Configurar Java 21
source "/home/$USER/.sdkman/bin/sdkman-init.sh"

# Configurar Android SDK
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Verificar configuración
java -version
adb version
```

### Paso 2: Instalar Dependencias del Proyecto
```bash
# Navegar al directorio del proyecto
cd /ruta/al/proyecto/Quiet_Ring

# Instalar dependencias de Node.js
npm install
```

### Paso 3: Construir la Aplicación Web
```bash
# Construir la aplicación Angular para producción
npx ng build --configuration production

# O para desarrollo
npx ng build
```

### Paso 4: Sincronizar con Capacitor
```bash
# Sincronizar la aplicación web con el proyecto nativo
npx cap sync
```

### Paso 5: Configurar el Proyecto Android

**Verificar configuración de Java en `android/gradle.properties`:**
```properties
# Java configuration
org.gradle.java.home=/home/$USER/.sdkman/candidates/java/current
```

**Verificar configuración en `android/app/build.gradle`:**
```gradle
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
}
```

### Paso 6: Limpiar Cache de Gradle
```bash
cd android
./gradlew clean
```

### Paso 7: Generar APK
```bash
# Para versión Debug (desarrollo)
./gradlew assembleDebug

# Para versión Release (producción)
./gradlew assembleRelease
```

### Paso 8: Localizar el APK Generado
```bash
# El APK se genera en:
ls -la app/build/outputs/apk/debug/
ls -la app/build/outputs/apk/release/

# Copiar a directorio de distribución
cd ..
mkdir -p dist
cp android/app/build/outputs/apk/debug/app-debug.apk dist/QuietRing-debug.apk
```

## 🔧 Comando Completo (Un Solo Script)

Crea un script `build-apk.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando construcción del APK..."

# Configurar entorno
source "/home/$USER/.sdkman/bin/sdkman-init.sh"
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Verificar prerrequisitos
echo "📋 Verificando prerrequisitos..."
java -version
adb version

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir aplicación web
echo "🌐 Construyendo aplicación web..."
npx ng build

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync

# Limpiar y construir APK
echo "🔨 Construyendo APK..."
cd android
./gradlew clean
./gradlew assembleDebug

# Copiar APK
echo "📱 Copiando APK..."
cd ..
mkdir -p dist
cp android/app/build/outputs/apk/debug/app-debug.apk dist/QuietRing-debug.apk

echo "✅ APK generado exitosamente en dist/QuietRing-debug.apk"
```

**Hacer ejecutable:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

## 🐛 Solución de Problemas

### Error: "Java version not found"
```bash
# Verificar instalación de Java 21
sdk list java
sdk use java 21.0.8-tem
```

### Error: "Android SDK not found"
```bash
# Configurar ANDROID_HOME
export ANDROID_HOME=~/Android/Sdk
echo 'export ANDROID_HOME=~/Android/Sdk' >> ~/.bashrc
```

### Error: "Gradle build failed"
```bash
# Limpiar cache
cd android
./gradlew clean
rm -rf .gradle
./gradlew assembleDebug
```

### Error: "Permission denied" en gradlew
```bash
chmod +x android/gradlew
```

## 📊 Información del APK Generado

- **Ubicación:** `dist/QuietRing-debug.apk`
- **Tamaño:** ~7 MB
- **Versión:** 1.0 (Debug)
- **API Mínima:** 23 (Android 6.0)
- **API Target:** 35 (Android 15)

## 🔄 Para Construcciones Futuras

Una vez configurado el entorno, solo necesitas:

```bash
# Configurar entorno (una sola vez por sesión)
source "/home/$USER/.sdkman/bin/sdkman-init.sh"
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Construir APK
npm install && npx ng build && npx cap sync
cd android && ./gradlew assembleDebug
cd .. && cp android/app/build/outputs/apk/debug/app-debug.apk dist/
```

## 📱 Instalación en Dispositivo

```bash
# Via ADB
adb install dist/QuietRing-debug.apk

# O transferir manualmente al dispositivo y activar "Orígenes desconocidos"
```

---
**Desarrollado con ❤️ usando Ionic + Angular + Capacitor**
