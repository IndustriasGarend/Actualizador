#!/bin/bash

# Script para instalar y configurar el servidor de Clic Actualizador Tools.
# Asume que Node.js y npm están preinstalados.

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando Instalación del Servidor Clic Actualizador Tools ===${NC}"

# --- Paso 1: Verificar prerrequisitos ---
echo -e "\n${YELLOW}[1/6] Verificando prerrequisitos...${NC}"

command -v node >/dev/null 2>&1 || { echo -e >&2 "${RED}Error: Node.js no está instalado. Por favor, instálalo y vuelve a intentarlo.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e >&2 "${RED}Error: npm no está instalado. Por favor, instálalo y vuelve a intentarlo.${NC}"; exit 1; }

echo "Node.js y npm encontrados."
node -v
npm -v

# --- Paso 2: Instalar PM2 si no existe ---
echo -e "\n${YELLOW}[2/6] Verificando el gestor de procesos PM2...${NC}"

if ! command -v pm2 >/dev/null 2>&1; then
    echo "PM2 no encontrado. Instalando PM2 globalmente..."
    if sudo npm install pm2 -g; then
        echo -e "${GREEN}PM2 instalado correctamente.${NC}"
    else
        echo -e "${RED}Error: Falló la instalación de PM2. Verifica tus permisos (puede que necesites 'sudo') y vuelve a intentarlo.${NC}"
        exit 1
    fi
else
    echo "PM2 ya está instalado."
fi

# --- Paso 3: Instalar dependencias del proyecto ---
echo -e "\n${YELLOW}[3/6] Instalando dependencias del proyecto con npm...${NC}"
if npm install; then
    echo -e "${GREEN}Dependencias instaladas correctamente.${NC}"
else
    echo -e "${RED}Error: Falló 'npm install'. Revisa los errores e inténtalo de nuevo.${NC}"
    exit 1
fi

# --- Paso 4: Construir la aplicación Next.js para producción ---
echo -e "\n${YELLOW}[4/6] Construyendo la aplicación Next.js para producción...${NC}"
if npm run build; then
    echo -e "${GREEN}Aplicación construida correctamente.${NC}"
else
    echo -e "${RED}Error: Falló 'npm run build'. Revisa los errores de compilación e inténtalo de nuevo.${NC}"
    exit 1
fi

# --- Paso 5: Iniciar la aplicación con PM2 ---
APP_NAME="clic-actualizador-server"
echo -e "\n${YELLOW}[5/6] Iniciando la aplicación con PM2...${NC}"

# Detener cualquier instancia previa con el mismo nombre
pm2 delete "$APP_NAME" >/dev/null 2>&1

if pm2 start npm --name "$APP_NAME" -- start; then
    echo -e "${GREEN}Servidor iniciado correctamente con PM2 bajo el nombre '$APP_NAME'.${NC}"
    echo "Puedes ver los logs con: pm2 logs $APP_NAME"
    echo "Puedes ver el estado con: pm2 status"
else
    echo -e "${RED}Error: Falló al iniciar la aplicación con PM2.${NC}"
    exit 1
fi

# --- Paso 6: Configurar PM2 para inicio automático ---
echo -e "\n${YELLOW}[6/6] Configurando PM2 para reinicio automático...${NC}"
pm2 save
if pm2 startup; then
    echo -e "${GREEN}¡Instalación completada!${NC}"
    echo "El servidor Clic Actualizador Tools está ahora en ejecución y se reiniciará automáticamente."
else
    echo -e "${YELLOW}Advertencia: No se pudo configurar el inicio automático de PM2. Puede que necesites ejecutar el comando que PM2 te sugiera con permisos de superusuario.${NC}"
fi

echo -e "\n${GREEN}=== Fin del Proceso de Instalación ===${NC}"
