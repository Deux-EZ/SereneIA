#!/bin/bash
# ============================================================
# Script para crear la base de datos del Backend SereneIA
# ============================================================
# 
# Este script crea la base de datos 'sereneia_users' en PostgreSQL
# 
# Uso: ./scripts/create_database.sh
# 
# Requisitos:
# - Docker corriendo con el contenedor de PostgreSQL
# - El contenedor 'sereneia_chatbot-postgres-1' debe estar activo
# ============================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  SereneIA - Creación de Base de Datos${NC}"
echo -e "${YELLOW}================================================${NC}"

# Nombre del contenedor de PostgreSQL
CONTAINER_NAME="sereneia_chatbot-postgres-1"
DB_NAME="sereneia_users"
DB_USER="postgres"

# Verificar que el contenedor está corriendo
echo -e "\n${YELLOW}🔍 Verificando contenedor PostgreSQL...${NC}"
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ El contenedor '$CONTAINER_NAME' no está corriendo.${NC}"
    echo -e "${YELLOW}   Ejecuta primero: cd SereneIA_ChatBot && docker compose up -d${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Contenedor PostgreSQL activo${NC}"

# Verificar si la base de datos ya existe
echo -e "\n${YELLOW}🔍 Verificando si la base de datos existe...${NC}"
DB_EXISTS=$(docker exec -i $CONTAINER_NAME psql -U $DB_USER -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${GREEN}✅ La base de datos '$DB_NAME' ya existe${NC}"
else
    # Crear la base de datos
    echo -e "\n${YELLOW}📦 Creando base de datos '$DB_NAME'...${NC}"
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✅ Base de datos '$DB_NAME' creada exitosamente${NC}"
fi

# Verificar la conexión
echo -e "\n${YELLOW}🔍 Verificando conexión...${NC}"
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null
echo -e "${GREEN}✅ Conexión exitosa${NC}"

# Mostrar información
echo -e "\n${YELLOW}================================================${NC}"
echo -e "${GREEN}🎉 Base de datos lista${NC}"
echo -e "${YELLOW}================================================${NC}"
echo -e "  📦 Base de datos: ${GREEN}$DB_NAME${NC}"
echo -e "  👤 Usuario: ${GREEN}$DB_USER${NC}"
echo -e "  🔑 Password: ${GREEN}123456${NC}"
echo -e "  🌐 Host: ${GREEN}localhost${NC}"
echo -e "  🔌 Puerto: ${GREEN}5432${NC}"
echo -e "${YELLOW}================================================${NC}"
echo -e "\n${YELLOW}📝 Próximos pasos:${NC}"
echo -e "  1. Activar entorno: ${GREEN}conda activate SereneIA${NC}"
echo -e "  2. Iniciar backend: ${GREEN}uvicorn app.main:app --reload${NC}"
echo -e "  3. El backend creará las tablas automáticamente"
echo -e "${YELLOW}================================================${NC}"
