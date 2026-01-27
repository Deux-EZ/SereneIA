# SereneIA - Sistema de Chatbot Inteligente

Sistema completo de chatbot con IA que integra **React**, **FastAPI**, **N8N**, **Ollama**, **PostgreSQL** y **Qdrant** para proporcionar conversaciones inteligentes con memoria persistente y capacidades RAG (Retrieval-Augmented Generation).

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Componentes](#-componentes)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)

---

## 🏗 Arquitectura

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Tailwind + Apollo Client
│   (Port 5173)   │  - Interfaz de usuario del chatbot
└────────┬────────┘  - Gestión de autenticación
         │
         │ GraphQL (HTTP + WebSocket)
         │
┌────────▼────────┐
│   Backend       │  FastAPI + Strawberry GraphQL + JWT
│   (Port 8000)   │  - Autenticación y autorización
└────────┬────────┘  - Proxy seguro hacia N8N
         │
         │ HTTP Webhook
         │
┌────────▼────────┐
│      N8N        │  Workflow Automation + AI Agent
│   (Port 5678)   │  - Orquestación de conversaciones
└─────┬───┬───┬───┘  - Gestión de memoria persistente
      │   │   │      - Integración con LLM y Vector Store
      │   │   │
      │   │   └──────────┐
      │   │              │
      │   ▼              ▼
      │ ┌──────────┐  ┌──────────┐
      │ │  Ollama  │  │  Qdrant  │
      │ │(Port     │  │(Port     │
      │ │ 11434)   │  │ 6333)    │
      │ └──────────┘  └──────────┘
      │  Qwen3:4b      Vector Store
      │  LLM Model     (RAG)
      │
      ▼
┌────────────────┐
│   PostgreSQL   │  Base de Datos
│   (Port 5432)  │  - Usuarios (Backend)
└────────────────┘  - Chat Memory (N8N)
                    - Sesiones de conversación

┌────────────────┐
│    pgAdmin     │  Administración de BD
│   (Port 5050)  │  - Gestión visual de PostgreSQL
└────────────────┘
```

### Flujo de Datos

1. **Usuario** ingresa mensaje en el **Frontend**
2. **Frontend** envía mutación GraphQL `sendMessage` al **Backend**
3. **Backend** valida JWT y extrae `user_id`
4. **Backend** envía POST al webhook de **N8N** con `sessionId` (UUID del usuario)
5. **N8N AI Agent**:
   - Recupera historial de conversación de **Postgres Chat Memory**
   - Envía prompt al modelo **Ollama (Qwen3:4b)**
   - Consulta **Qdrant** si necesita información adicional (RAG)
   - Guarda nueva interacción en **Postgres Chat Memory**
6. **N8N** devuelve respuesta al **Backend**
7. **Backend** devuelve respuesta al **Frontend** vía GraphQL
8. **Frontend** muestra la respuesta al usuario

---

## 🧩 Componentes

### Frontend (SereneIA_FrontEnd)
- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **GraphQL**: Apollo Client
- **Estado**: Zustand
- **Funcionalidades**:
  - Interfaz de chat en tiempo real
  - Sistema de autenticación (login/registro)
  - Gestión de sesiones con JWT
  - Historial de conversaciones

### Backend (SereneIA_BackEnd)
- **Framework**: FastAPI + Uvicorn
- **GraphQL**: Strawberry
- **ORM**: SQLAlchemy (async)
- **Autenticación**: JWT + bcrypt
- **Base de Datos**: PostgreSQL (solo usuarios)
- **Funcionalidades**:
  - API GraphQL para autenticación
  - Gestión de usuarios (CRUD)
  - Proxy seguro hacia N8N
  - Validación y autorización

### Chatbot (SereneIA_ChatBot)
- **Orquestador**: N8N
- **LLM**: Ollama (Qwen3:4b)
- **Memoria**: Postgres Chat Memory
- **Vector Store**: Qdrant
- **Embeddings**: Ollama (embeddinggemma)
- **Funcionalidades**:
  - AI Agent para procesamiento de lenguaje natural
  - Memoria persistente por usuario (sessionId)
  - RAG para consultas contextuales
  - Integración con múltiples fuentes de datos

---

## 📦 Requisitos

### Software Requerido

| Software | Versión Mínima | Propósito |
|----------|----------------|-----------|
| **Python** | 3.11+ | Backend API |
| **Node.js** | 18+ | Frontend |
| **Docker** | 24+ | Contenedores |
| **Docker Compose** | 2.0+ | Orquestación |
| **PostgreSQL** | 15+ | Base de datos |

### Puertos Utilizados

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| 5173 | Frontend | React (desarrollo) |
| 8000 | Backend | FastAPI + GraphQL |
| 5678 | N8N | Workflow automation |
| 11434 | Ollama | LLM API |
| 5432 | PostgreSQL | Base de datos |
| 6333 | Qdrant | Vector store |
| 5050 | pgAdmin | Admin PostgreSQL |

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd SereneIA
```

### 2. Instalar Ollama

**Ubuntu/WSL:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Configurar Ollama para escuchar en todas las interfaces:**
```bash
sudo mkdir -p /etc/systemd/system/ollama.service.d
echo '[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"' | sudo tee /etc/systemd/system/ollama.service.d/override.conf
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

**Descargar modelos:**
```bash
ollama pull qwen3:4b
ollama pull embeddinggemma:latest
```

### 3. Configurar Backend

```bash
cd SereneIA_BackEnd

# Crear entorno virtual (conda o venv)
conda create -n SereneIA python=3.11
conda activate SereneIA

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Editar .env con tus valores

# Crear base de datos
psql -U postgres -h localhost
CREATE DATABASE sereneia_users;
\q
```

### 4. Configurar Chatbot (N8N + PostgreSQL + Qdrant)

```bash
cd SereneIA_ChatBot

# Configurar variables de entorno
# Editar .env con tus valores

# Levantar servicios con Docker Compose
docker compose up -d

# Verificar que todos los servicios estén corriendo
docker compose ps
```

### 5. Configurar Frontend

```bash
cd SereneIA_FrontEnd

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear .env con la URL del backend
echo "VITE_GRAPHQL_URL=http://localhost:8000/graphql" > .env
```

---

## ⚙️ Configuración

### Backend (.env)

```env
# Base de Datos
DATABASE_URL=postgresql+asyncpg://postgres:123456@localhost:5432/sereneia_users

# JWT
JWT_SECRET_KEY=<genera-con-openssl-rand-base64-32>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# N8N
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_PATH=/webhook/<tu-webhook-id>
N8N_TIMEOUT_SECONDS=120

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Application
DEBUG=true
```

### Chatbot (.env)

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=n8n

# N8N
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=123456
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_PORT=5432

# Seguridad
N8N_ENCRYPTION_KEY=<genera-con-openssl-rand-base64-32>

# Puertos
N8N_PORT=5678
QDRANT_PORT=6333

# Configuración
GENERIC_TIMEZONE=America/Bogota
TZ=America/Bogota
```

### N8N Workflow

1. Acceder a N8N: http://localhost:5678
2. Importar el workflow del AI Agent
3. Configurar credenciales:
   - Ollama API (http://host.docker.internal:11434)
   - PostgreSQL (postgres:5432)
   - Qdrant (qdrant:6333)
4. Copiar el webhook ID al archivo `.env` del Backend

---

## ▶️ Ejecución

### 1. Iniciar servicios del Chatbot

```bash
cd SereneIA_ChatBot
docker compose up -d
```

Verificar: http://localhost:5678 (N8N), http://localhost:5050 (pgAdmin)

### 2. Iniciar Backend

```bash
cd SereneIA_BackEnd
conda activate SereneIA  # o tu entorno virtual
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verificar: http://localhost:8000/graphql

### 3. Iniciar Frontend

```bash
cd SereneIA_FrontEnd
npm run dev
```

Acceder: http://localhost:5173

---

## 📖 Uso

### Registro e Inicio de Sesión

1. Acceder a http://localhost:5173
2. Crear una cuenta nueva con email, usuario y contraseña
3. Iniciar sesión con las credenciales

### Chat con el Bot

1. Una vez autenticado, aparece la interfaz del chat
2. Escribir un mensaje en el cuadro de texto
3. El bot procesará el mensaje con IA y responderá
4. El historial se mantiene automáticamente por usuario

### GraphQL Playground (Desarrollo)

Acceder a http://localhost:8000/graphql para probar queries/mutations:

```graphql
# Registro
mutation {
  register(input: {
    email: "user@example.com"
    username: "usuario"
    password: "password123"
    fullName: "Usuario Ejemplo"
  }) {
    accessToken
    user { id username }
  }
}

# Enviar mensaje
mutation {
  sendMessage(input: {
    message: "¿Cuál es la capital de Francia?"
  }) {
    success
    response
  }
}
```

---

## 📂 Estructura del Proyecto

```
SereneIA/
├── SereneIA_BackEnd/          # Backend FastAPI + GraphQL
│   ├── app/
│   │   ├── core/              # Configuración, seguridad, DB
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── repositories/      # Patrón Repository
│   │   ├── services/          # Servicios externos (N8N)
│   │   ├── graphql/           # Schema y resolvers
│   │   └── main.py            # Punto de entrada
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
├── SereneIA_ChatBot/          # N8N + Docker Compose
│   ├── docker-compose.yml     # PostgreSQL, N8N, Qdrant, pgAdmin
│   ├── .env
│   ├── n8n/
│   │   └── backup/            # Workflows y credenciales
│   └── shared/                # Datos compartidos
│
├── SereneIA_FrontEnd/         # React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── services/          # Apollo Client
│   │   ├── store/             # Zustand
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── README.md
│
└── README.md                  # Este archivo
```

---

## 🛠 Tecnologías

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Apollo Client (GraphQL)
- Zustand (State Management)

### Backend
- FastAPI
- Strawberry GraphQL
- SQLAlchemy (async)
- PostgreSQL
- JWT + bcrypt
- Pydantic

### Chatbot & IA
- N8N (Workflow Automation)
- Ollama (LLM - Qwen3:4b)
- Qdrant (Vector Database)
- PostgreSQL (Chat Memory)

### DevOps
- Docker & Docker Compose
- WSL2 (Ubuntu)

---

## 📝 Notas Importantes

1. **sessionId**: El UUID del usuario es crucial para mantener el historial de conversaciones en N8N
2. **Ollama**: Debe estar configurado para escuchar en `0.0.0.0` para que N8N pueda acceder desde Docker
3. **Persistencia**: Todos los volúmenes de Docker están configurados para persistir datos
4. **Seguridad**: Cambiar `JWT_SECRET_KEY` y `N8N_ENCRYPTION_KEY` en producción
5. **Puertos**: Asegurarse de que no haya conflictos de puertos

---

## 🐛 Troubleshooting

### N8N no se conecta a Ollama
```bash
# Verificar que Ollama esté escuchando en todas las interfaces
sudo systemctl status ollama
curl http://localhost:11434/api/version

# Desde N8N usar: http://host.docker.internal:11434
```

### Backend no se conecta a PostgreSQL
```bash
# Verificar que la base de datos exista
psql -U postgres -l | grep sereneia_users

# Verificar conexión
psql -U postgres -d sereneia_users -c "SELECT 1;"
```

### Frontend no se conecta al Backend
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/health

# Verificar CORS en .env del backend
```

---

## 📄 Licencia

MIT

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, crear un issue o pull request.

---

## 📧 Contacto

Para preguntas o soporte, contactar a [tu-email@example.com]
