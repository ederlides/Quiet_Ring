#!/bin/bash

# 🚀 Script para Generar APK - Quiet Ring
# Este script automatiza todo el proceso de construcción del APK

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando construcción del APK para Quiet Ring...${NC}"

# Función para mostrar mensajes con color
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Paso 1: Configurar entorno
log_info "Configurando entorno de desarrollo..."

# Configurar Java 21
if [ -f "/home/$USER/.sdkman/bin/sdkman-init.sh" ]; then
    source "/home/$USER/.sdkman/bin/sdkman-init.sh"
    log_success "Java 21 configurado via SDKMAN"
else
    log_warning "SDKMAN no encontrado. Asegúrate de tener Java 21 instalado."
fi

# Configurar Android SDK
if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME=~/Android/Sdk
    log_info "ANDROID_HOME configurado a: $ANDROID_HOME"
fi

export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Verificar prerrequisitos
log_info "Verificando prerrequisitos..."

if ! command -v java &> /dev/null; then
    log_error "Java no está instalado o no está en el PATH"
    exit 1
fi

if ! command -v adb &> /dev/null; then
    log_error "Android SDK no está configurado correctamente"
    exit 1
fi

log_success "Prerrequisitos verificados"

# Paso 2: Instalar dependencias
log_info "Instalando dependencias de Node.js..."
if npm install; then
    log_success "Dependencias instaladas"
else
    log_error "Error al instalar dependencias"
    exit 1
fi

# Paso 3: Construir aplicación web
log_info "Construyendo aplicación web..."
if npx ng build; then
    log_success "Aplicación web construida"
else
    log_error "Error al construir aplicación web"
    exit 1
fi

# Paso 4: Sincronizar con Capacitor
log_info "Sincronizando con Capacitor..."
if npx cap sync; then
    log_success "Capacitor sincronizado"
else
    log_error "Error al sincronizar Capacitor"
    exit 1
fi

# Paso 5: Limpiar y construir APK
log_info "Construyendo APK de Android..."
cd android

if ./gradlew clean; then
    log_success "Cache de Gradle limpiado"
else
    log_error "Error al limpiar cache de Gradle"
    exit 1
fi

if ./gradlew assembleDebug; then
    log_success "APK construido exitosamente"
else
    log_error "Error al construir APK"
    exit 1
fi

# Paso 6: Copiar APK
cd ..
log_info "Copiando APK al directorio de distribución..."

mkdir -p dist
if cp android/app/build/outputs/apk/debug/app-debug.apk dist/QuietRing-debug.apk; then
    log_success "APK copiado a dist/QuietRing-debug.apk"
else
    log_error "Error al copiar APK"
    exit 1
fi

# Mostrar información del APK
APK_SIZE=$(du -h dist/QuietRing-debug.apk | cut -f1)
APK_PATH=$(pwd)/dist/QuietRing-debug.apk

echo ""
echo -e "${GREEN}🎉 ¡APK GENERADO EXITOSAMENTE! 🎉${NC}"
echo ""
echo -e "${BLUE}📱 Información del APK:${NC}"
echo -e "   📂 Ubicación: ${YELLOW}$APK_PATH${NC}"
echo -e "   📏 Tamaño: ${YELLOW}$APK_SIZE${NC}"
echo -e "   🏷️  Versión: ${YELLOW}1.0 (Debug)${NC}"
echo -e "   📱 Plataforma: ${YELLOW}Android${NC}"
echo ""
echo -e "${BLUE}📲 Para instalar en dispositivo:${NC}"
echo -e "   1. Transfiere el APK a tu dispositivo Android"
echo -e "   2. Activa 'Orígenes desconocidos' en Configuración > Seguridad"
echo -e "   3. Abre el APK y toca 'Instalar'"
echo ""
echo -e "${BLUE}🔧 O instala via ADB:${NC}"
echo -e "   ${YELLOW}adb install $APK_PATH${NC}"
echo ""

log_success "Proceso completado. ¡Tu APK está listo para instalar!"
