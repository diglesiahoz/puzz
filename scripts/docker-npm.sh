#!/bin/bash

# Script helper para ejecutar comandos npm dentro del contenedor Docker
# Uso: ./scripts/docker-npm.sh [comando]
# Ejemplo: ./scripts/docker-npm.sh install
# Ejemplo: ./scripts/docker-npm.sh run build

set -e

# Detectar el nombre del contenedor
CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep -E "(www|web|drupal)" | head -n1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ No se encontró un contenedor Docker con 'www', 'web' o 'drupal' en el nombre."
    echo "   Contenedores disponibles:"
    docker ps --format "{{.Names}}"
    exit 1
fi

# Ruta del tema dentro del contenedor
THEME_PATH="/var/www/html/drupal/web/themes/custom/puzz"

# Si no se proporciona comando, mostrar ayuda
if [ $# -eq 0 ]; then
    echo "📦 Ejecutando npm en contenedor: $CONTAINER_NAME"
    echo "📁 Ruta del tema: $THEME_PATH"
    echo ""
    echo "Uso: $0 [comando npm]"
    echo ""
    echo "Ejemplos:"
    echo "  $0 install              # Instalar dependencias"
    echo "  $0 run build            # Compilar componentes"
    echo "  $0 run dev              # Modo desarrollo con hot reload"
    echo "  $0 run clean            # Limpiar directorio build"
    echo ""
    exit 0
fi

# Ejecutar comando npm dentro del contenedor
echo "🚀 Ejecutando: npm $*"
echo "📦 Contenedor: $CONTAINER_NAME"
echo "📁 Ruta: $THEME_PATH"
echo ""

docker exec -it "$CONTAINER_NAME" bash -c "cd $THEME_PATH && npm $*"
