# SereneIA Backend API

Backend GraphQL para SereneIA - Sistema de Chatbot con IA.

## Arquitectura

```
┌─────────────┐     GraphQL      ┌─────────────┐     Webhook      ┌─────────────┐
│   Frontend  │ ───────────────► │   Backend   │ ───────────────► │     N8N     │
│   (React)   │ ◄─────────────── │  (FastAPI)  │ ◄─────────────── │  (AI Agent) │
└─────────────┘                  └─────────────┘                  └─────────────┘
                                       │                                │
                                       │                                │
                                       ▼                                ▼
                                ┌─────────────┐                  ┌─────────────┐
                                │  PostgreSQL │                  │   Ollama    │
                                │  (Usuarios) │                  │  (Qwen3:4b) │
                                └─────────────┘                  └─────────────┘
                                                                       │
                                                                       ▼
                                                                ┌─────────────┐
                                                                │   Qdrant    │
                                                                │(Vector Store)│
                                                                └─────────────┘
```

### Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| **Backend** | Autenticación (JWT), autorización, proxy seguro a N8N |
| **N8N** | Procesamiento de chat, memoria de conversaciones, LLM, RAG |
| **PostgreSQL** | Usuarios (Backend) + Chat Memory (N8N) |
| **Ollama** | Modelo de lenguaje (Qwen3:4b) |
| **Qdrant** | Vector store para RAG |

## Estructura del Proyecto

```
app/
├── __init__.py
├── main.py                 # Punto de entrada FastAPI
├── core/                   # Configuración y utilidades
│   ├── config.py          # Variables de entorno
│   ├── database.py        # Conexión PostgreSQL
│   ├── security.py        # JWT y hashing
│   └── exceptions.py      # Excepciones personalizadas
├── models/                 # Modelos SQLAlchemy
│   └── user.py            # Solo usuarios (N8N maneja conversaciones)
├── repositories/           # Patrón Repository
│   └── user_repository.py
├── services/              # Servicios externos
│   └── n8n_service.py     # Comunicación con N8N
└── graphql/               # API GraphQL
    ├── schema.py          # Schema principal
    ├── dependencies.py    # Autenticación
    ├── types/             # Tipos GraphQL
    └── resolvers/         # Queries y Mutations
```

## Instalación

### Requisitos

- Python 3.11+
- PostgreSQL 15+
- N8N corriendo con el workflow del chatbot

### 1. Crear entorno virtual

```bash
cd SereneIA_BackEnd
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus valores.

### 4. Crear base de datos

```bash
# Conectar a PostgreSQL y crear la base de datos
psql -U postgres -h localhost
CREATE DATABASE sereneia_users;
\q
```

### 5. Ejecutar

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API GraphQL

### Endpoints

- **GraphQL Playground**: http://localhost:8000/graphql
- **Health Check**: http://localhost:8000/health
- **Docs (dev)**: http://localhost:8000/docs

### Queries

```graphql
# Health check completo
query {
  health {
    backend
    n8n
    database
  }
}

# Obtener perfil del usuario autenticado
query {
  me {
    id
    email
    username
    fullName
    role
  }
}
```

### Mutations

```graphql
# Registro de usuario
mutation {
  register(input: {
    email: "user@example.com"
    username: "usuario"
    password: "password123"
    fullName: "Usuario Ejemplo"
  }) {
    accessToken
    refreshToken
    user {
      id
      username
    }
  }
}

# Login
mutation {
  login(input: {
    username: "usuario"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      username
    }
  }
}

# Enviar mensaje al chatbot
mutation {
  sendMessage(input: {
    message: "Hola, ¿cómo estás?"
  }) {
    success
    response
    sessionId
    error
  }
}
```

## Integración con N8N

### Flujo de mensajes

1. **Frontend** envía mensaje via GraphQL mutation `sendMessage`
2. **Backend** valida JWT del usuario
3. **Backend** envía POST al webhook de N8N con:
   ```json
   {
     "sessionId": "uuid-del-usuario",
     "chatInput": "mensaje del usuario",
     "userName": "nombre del usuario"
   }
   ```
4. **N8N** procesa con AI Agent:
   - Recupera historial de Postgres Chat Memory usando `sessionId`
   - Genera respuesta con Ollama (Qwen3:4b)
   - Consulta Qdrant si necesita RAG
   - Guarda nuevo mensaje en Postgres Chat Memory
5. **N8N** devuelve respuesta al Backend
6. **Backend** devuelve respuesta al Frontend via GraphQL

### Configuración del Webhook en N8N

El campo `sessionId` es **crítico** para que N8N mantenga el historial de conversación por usuario.

## Seguridad

- **JWT**: Tokens de acceso (30 min) y refresco (7 días)
- **bcrypt**: Hash de contraseñas con factor 12
- **CORS**: Restringido a orígenes configurados
- **Validación**: Pydantic para inputs, Strawberry para GraphQL

## Licencia

MIT
