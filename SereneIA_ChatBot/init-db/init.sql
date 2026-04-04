-- ============================================================
-- SerenAI - Inicialización de bases de datos
-- Este script corre automáticamente al primer inicio de PostgreSQL
-- Crea las dos bases de datos necesarias en el mismo servidor
-- ============================================================

-- Base de datos para N8N (workflows, credenciales, historial de chat)
SELECT 'CREATE DATABASE n8n'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec

-- Base de datos para el Backend FastAPI (usuarios, conversaciones)
SELECT 'CREATE DATABASE sereneia_users'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sereneia_users')\gexec
