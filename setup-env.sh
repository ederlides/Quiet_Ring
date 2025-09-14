#!/bin/bash

# 🔧 Script de Configuración de Entorno - Quiet Ring
# Ejecuta este script una vez para configurar tu entorno de desarrollo

echo "🔧 Configurando entorno de desarrollo para Quiet Ring..."

# Configurar Java 21 via SDKMAN
if [ -f "/home/$USER/.sdkman/bin/sdkman-init.sh" ]; then
    source "/home/$USER/.sdkman/bin/sdkman-init.sh"
    echo "✅ Java 21 configurado via SDKMAN"
    java -version
else
    echo "⚠️  SDKMAN no encontrado. Instalando..."
    curl -s "https://get.sdkman.io" | bash
    source "/home/$USER/.sdkman/bin/sdkman-init.sh"
    sdk install java 21.0.8-tem
    sdk use java 21.0.8-tem
    echo "✅ Java 21 instalado y configurado"
fi

# Configurar Android SDK
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

echo "✅ Android SDK configurado"
echo "   ANDROID_HOME: $ANDROID_HOME"

# Agregar configuración permanente al .bashrc
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Configuración para Quiet Ring" >> ~/.bashrc
    echo "export ANDROID_HOME=~/Android/Sdk" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/build-tools/34.0.0" >> ~/.bashrc
    echo "source ~/.sdkman/bin/sdkman-init.sh" >> ~/.bashrc
    echo "✅ Configuración agregada a ~/.bashrc"
fi

# Verificar instalación
echo ""
echo "🔍 Verificando instalación..."
echo "Java: $(java -version 2>&1 | head -n 1)"
echo "Android SDK: $(adb version 2>&1 | head -n 1)"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"

echo ""
echo "✅ ¡Entorno configurado correctamente!"
echo "💡 Ahora puedes ejecutar ./build-apk.sh para generar el APK"
