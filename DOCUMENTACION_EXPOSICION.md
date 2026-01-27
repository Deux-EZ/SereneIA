# 🧘 SerenAI - Documentación para Exposición

## Tu Compañero de Bienestar Emocional Impulsado por IA

---

# 📋 Índice

1. [Introducción](#1-introducción)
2. [El Problema que Resolvemos](#2-el-problema-que-resolvemos)
3. [Nuestra Solución](#3-nuestra-solución)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Tecnologías Utilizadas](#5-tecnologías-utilizadas)
6. [Módulos del Sistema](#6-módulos-del-sistema)
7. [Flujo de Datos](#7-flujo-de-datos)
8. [Funcionalidades Principales](#8-funcionalidades-principales)
9. [Seguridad y Privacidad](#9-seguridad-y-privacidad)
10. [Instalación y Despliegue](#10-instalación-y-despliegue)
11. [Casos de Uso](#11-casos-de-uso)
12. [Futuras Mejoras](#12-futuras-mejoras)
13. [Equipo y Contacto](#13-equipo-y-contacto)

---

# 1. Introducción

## ¿Qué es SerenAI?

**SerenAI** es una aplicación web innovadora que proporciona un **asistente de bienestar emocional** impulsado por Inteligencia Artificial. Funciona como un espacio seguro donde los usuarios pueden expresar sus emociones, recibir apoyo empático y obtener herramientas prácticas para mejorar su salud mental.

### 🎯 Misión
Democratizar el acceso al apoyo emocional, ofreciendo un compañero disponible 24/7 que escucha sin juzgar y ayuda a las personas a navegar sus emociones.

### 👁️ Visión
Ser el primer punto de contacto para personas que buscan mejorar su bienestar emocional, complementando (nunca reemplazando) la atención profesional de salud mental.

### 💜 Valores
- **Empatía**: Respuestas que comprenden y validan las emociones
- **Privacidad**: Conversaciones 100% confidenciales
- **Accesibilidad**: Disponible 24/7, sin citas ni esperas
- **No juicio**: Un espacio libre de críticas

---

# 2. El Problema que Resolvemos

## 📊 Contexto Global

| Estadística | Dato |
|-------------|------|
| Personas con trastornos mentales | 1 de cada 4 en el mundo |
| Brecha de tratamiento | 75% no recibe atención adecuada |
| Costo global de depresión/ansiedad | $1 trillón USD/año |
| Tiempo de espera promedio para cita psicológica | 2-6 semanas |

## 🚧 Barreras Actuales

1. **Estigma social**: Miedo a ser juzgado por buscar ayuda
2. **Costo elevado**: Terapia privada inaccesible para muchos
3. **Disponibilidad limitada**: Horarios de oficina, listas de espera
4. **Falta de profesionales**: Déficit global de psicólogos
5. **Vergüenza**: Dificultad para expresar emociones cara a cara

## 💡 La Oportunidad

SerenAI aborda estas barreras ofreciendo:
- ✅ Anonimato total (sin estigma)
- ✅ Gratuito/bajo costo
- ✅ Disponible 24/7
- ✅ Escalable infinitamente
- ✅ Comunicación escrita (más cómoda para muchos)

---

# 3. Nuestra Solución

## 🤖 Asistente IA Empático

SerenAI utiliza un modelo de lenguaje avanzado (LLM) específicamente configurado para:

### Características del Asistente

| Característica | Descripción |
|----------------|-------------|
| **Tono empático** | Respuestas cálidas y comprensivas |
| **Escucha activa** | Reformula y valida las emociones del usuario |
| **No directivo** | No impone soluciones, guía al autoconocimiento |
| **Herramientas prácticas** | Ofrece técnicas de respiración, journaling, etc. |
| **Derivación responsable** | Recomienda ayuda profesional cuando es necesario |

### Ejemplo de Conversación

```
👤 Usuario: "Últimamente me siento muy abrumado con el trabajo y no puedo dormir bien"

🤖 SerenAI: "Entiendo lo agotador que puede ser sentirse abrumado, especialmente 
cuando afecta tu descanso 💜 El estrés laboral es algo muy común, y es importante 
que lo estés reconociendo.

Te sugiero algunas cosas que podrían ayudarte:

✨ **Técnica de respiración 4-7-8**: Inhala 4 segundos, mantén 7, exhala 8
🌙 **Higiene del sueño**: Evita pantallas 1 hora antes de dormir
📝 **Brain dump**: Escribe todas tus preocupaciones antes de acostarte

¿Te gustaría que profundicemos en alguna de estas técnicas?"
```

---

# 4. Arquitectura del Sistema

## 🏗️ Visión General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARQUITECTURA SerenAI                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐      │
│    │   FRONTEND   │         │   BACKEND    │         │   CHATBOT    │      │
│    │    React     │◄───────►│   FastAPI    │◄───────►│     N8N      │      │
│    │  TypeScript  │ GraphQL │   GraphQL    │ Webhook │   + Ollama   │      │
│    └──────────────┘         └──────────────┘         └──────────────┘      │
│           │                        │                        │              │
│           │                        │                        │              │
│           ▼                        ▼                        ▼              │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐      │
│    │   Zustand    │         │  PostgreSQL  │         │   Qdrant     │      │
│    │   Estado     │         │   Usuarios   │         │    RAG       │      │
│    └──────────────┘         └──────────────┘         └──────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Comunicación

```
Usuario escribe mensaje
        │
        ▼
┌───────────────────┐
│  Frontend (React) │  ← Interfaz de usuario
└────────┬──────────┘
         │ GraphQL Mutation
         ▼
┌───────────────────┐
│ Backend (FastAPI) │  ← Autenticación + Autorización
└────────┬──────────┘
         │ Webhook HTTP
         ▼
┌───────────────────┐
│   N8N Workflow    │  ← Orquestación de IA
└────────┬──────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Ollama │ │Qdrant │  ← LLM + Memoria Contextual
└───┬───┘ └───┬───┘
    └────┬────┘
         │ Respuesta IA
         ▼
┌───────────────────┐
│  Usuario recibe   │
│    respuesta      │
└───────────────────┘
```

---

# 5. Tecnologías Utilizadas

## 🎨 Frontend

| Tecnología | Propósito | ¿Por qué esta tecnología? |
|------------|-----------|---------------------------|
| **React 19** | Framework UI | Componentes reutilizables, gran ecosistema |
| **TypeScript** | Lenguaje | Tipado estático, menos errores |
| **Vite** | Build tool | Desarrollo ultra rápido (HMR) |
| **Tailwind CSS** | Estilos | Utility-first, diseño rápido |
| **Apollo Client** | GraphQL Client | Caché inteligente, estado global |
| **Zustand** | Estado global | Simple, ligero, sin boilerplate |
| **Lucide React** | Iconos | Iconos modernos y consistentes |
| **React Markdown** | Renderizado | Formato rico en respuestas |

## ⚙️ Backend

| Tecnología | Propósito | ¿Por qué esta tecnología? |
|------------|-----------|---------------------------|
| **Python 3.11** | Lenguaje | Ideal para IA/ML, gran ecosistema |
| **FastAPI** | Framework web | Async, rápido, documentación automática |
| **Strawberry** | GraphQL | Type-safe, integración con Python |
| **SQLAlchemy** | ORM | Abstracción de BD, migraciones |
| **PostgreSQL** | Base de datos | Robusta, JSONB, escalable |
| **JWT** | Autenticación | Stateless, seguro |
| **Bcrypt** | Hashing | Contraseñas seguras |

## 🤖 Motor de IA (Chatbot)

| Tecnología | Propósito | ¿Por qué esta tecnología? |
|------------|-----------|---------------------------|
| **N8N** | Orquestación | No-code, workflows visuales |
| **Ollama** | LLM local | Privacidad, sin costos de API |
| **Llama 3.1** | Modelo | Open source, alta calidad |
| **Qdrant** | Vector DB | RAG para memoria contextual |
| **Docker** | Contenedores | Despliegue consistente |

## 🗄️ Infraestructura

| Componente | Tecnología |
|------------|------------|
| Contenedores | Docker + Docker Compose |
| Base de datos | PostgreSQL 16 |
| Proxy/Túnel | Ngrok (desarrollo) |
| Control de versiones | Git + GitHub |

---

# 6. Módulos del Sistema

## 📦 Módulo 1: Frontend (SereneIA_FrontEnd)

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
│   ├── AuthForm.tsx     # Formulario login/registro
│   ├── ChatInterface.tsx # Interfaz de chat principal
│   ├── MessageBubble.tsx # Burbujas de mensaje con markdown
│   ├── Common.tsx       # Botones, inputs, alerts
│   └── ModulesDocs.tsx  # Documentación interna
├── pages/
│   ├── LandingPage.tsx  # Página de bienvenida
│   └── AuthPage.tsx     # Página de autenticación
├── layouts/
│   └── MainLayout.tsx   # Layout principal con navbar
├── services/
│   ├── authService.ts   # Lógica de autenticación
│   └── chatService.ts   # Lógica de chat
├── store/
│   └── index.ts         # Estado global (Zustand)
├── graphql/
│   ├── queries.ts       # Consultas GraphQL
│   └── mutations.ts     # Mutaciones GraphQL
├── hooks/
│   └── useAuth.ts       # Hook de autenticación
├── lib/
│   └── apollo.ts        # Cliente Apollo configurado
└── types/
    └── index.ts         # Tipos TypeScript
```

### Componentes Principales

| Componente | Función |
|------------|---------|
| `LandingPage` | Página de inicio con información del producto |
| `AuthForm` | Manejo de login y registro |
| `ChatWindow` | Área de mensajes y input |
| `ConversationList` | Lista de conversaciones del usuario |
| `MessageBubble` | Renderizado de mensajes con markdown |
| `MainLayout` | Navbar y estructura general |

---

## 📦 Módulo 2: Backend (SereneIA_BackEnd)

### Estructura de Carpetas
```
app/
├── core/
│   ├── config.py        # Configuración (env vars)
│   ├── security.py      # JWT, hashing passwords
│   ├── database.py      # Conexión a PostgreSQL
│   ├── init.py          # Inicialización (crear tablas, admin)
│   └── exceptions.py    # Excepciones personalizadas
├── models/
│   ├── user.py          # Modelo de Usuario
│   └── conversation.py  # Modelo de Conversación
├── graphql/
│   ├── schema.py        # Schema GraphQL principal
│   ├── types/           # Tipos GraphQL
│   │   ├── user_types.py
│   │   ├── chat_types.py
│   │   └── common_types.py
│   ├── resolvers/       # Resolvers (lógica)
│   │   ├── auth_resolvers.py
│   │   └── conversation_resolvers.py
│   └── dependencies.py  # Inyección de dependencias
├── services/
│   └── n8n_service.py   # Comunicación con N8N
└── main.py              # Punto de entrada FastAPI
```

### API GraphQL

#### Queries (Consultas)
```graphql
# Obtener usuario actual
me: UserType

# Obtener conversaciones del usuario
conversations(limit: Int, offset: Int): ConversationListPayload

# Obtener historial de una conversación
conversationHistory(conversationId: ID!): [ChatMessage!]!
```

#### Mutations (Operaciones)
```graphql
# Autenticación
login(input: LoginInput!): AuthPayload!
register(input: RegisterInput!): AuthPayload!
logout: Boolean!
refreshToken(refreshToken: String!): AuthPayload!

# Conversaciones
createConversation(input: CreateConversationInput): ConversationPayload!
deleteConversation(conversationId: ID!): DeletePayload!
sendMessage(input: SendMessageInput!): ChatMessagePayload!
```

---

## 📦 Módulo 3: Motor de IA (SereneIA_ChatBot)

### Componentes N8N

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW N8N                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Webhook  │───►│  AI      │───►│ Postgres │              │
│  │ Trigger  │    │  Agent   │    │ Memory   │              │
│  └──────────┘    └────┬─────┘    └──────────┘              │
│                       │                                     │
│                       ▼                                     │
│                  ┌──────────┐                               │
│                  │  Ollama  │ ◄── LLM (Llama 3.1)          │
│                  │   LLM    │                               │
│                  └────┬─────┘                               │
│                       │                                     │
│                       ▼                                     │
│                  ┌──────────┐                               │
│                  │  Qdrant  │ ◄── RAG (Retrieval)          │
│                  │  Vector  │                               │
│                  └──────────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Prompt del Sistema (System Prompt)

El agente de IA está configurado con un prompt especializado en salud mental:

```
Eres SerenAI, un asistente de bienestar emocional. Tu rol es:

1. ESCUCHAR con empatía y sin juzgar
2. VALIDAR las emociones del usuario
3. OFRECER técnicas prácticas (respiración, mindfulness, etc.)
4. NUNCA diagnosticar ni recetar medicamentos
5. DERIVAR a profesionales cuando detectes crisis

Usa un tono cálido, cercano y esperanzador. Incluye emojis 
ocasionalmente para humanizar la conversación.
```

---

# 7. Flujo de Datos

## 🔐 Autenticación

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│Frontend │         │ Backend │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │ 1. Login Request  │                   │
     │ (email, password) │                   │
     │──────────────────►│                   │
     │                   │ 2. Buscar usuario │
     │                   │──────────────────►│
     │                   │◄──────────────────│
     │                   │ 3. Verificar hash │
     │                   │ 4. Generar JWT    │
     │◄──────────────────│                   │
     │ 5. Token + User   │                   │
     │                   │                   │
     │ 6. Guardar token  │                   │
     │ en localStorage   │                   │
```

## 💬 Envío de Mensaje

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Frontend │     │ Backend │     │   N8N   │     │ Ollama  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 1. SendMessage│               │               │
     │──────────────►│               │               │
     │               │ 2. Validar JWT│               │
     │               │ 3. Webhook    │               │
     │               │──────────────►│               │
     │               │               │ 4. Cargar     │
     │               │               │    contexto   │
     │               │               │──────────────►│
     │               │               │◄──────────────│
     │               │               │ 5. Respuesta  │
     │               │◄──────────────│    IA         │
     │◄──────────────│ 6. Response   │               │
     │               │               │               │
```

---

# 8. Funcionalidades Principales

## ✅ Implementadas

### 🔐 Sistema de Autenticación
- [x] Registro de usuarios
- [x] Login con email/contraseña
- [x] Tokens JWT con expiración (1 hora)
- [x] Refresh tokens (7 días)
- [x] Logout con limpieza de sesión
- [x] Validación de contraseñas (8+ caracteres)

### 💬 Chat con IA
- [x] Envío de mensajes en tiempo real
- [x] Respuestas empáticas de IA
- [x] Renderizado de Markdown (negritas, listas, etc.)
- [x] Indicador de "escribiendo..."
- [x] Historial de conversaciones
- [x] Múltiples conversaciones por usuario

### 🎨 Interfaz de Usuario
- [x] Landing page atractiva
- [x] Diseño responsivo (mobile/desktop)
- [x] Tema claro con colores cálidos
- [x] Animaciones suaves
- [x] Avatares de usuario con fallback
- [x] Burbujas de mensaje estilizadas

### 📊 Gestión de Conversaciones
- [x] Crear nueva conversación
- [x] Listar conversaciones
- [x] Seleccionar conversación
- [x] Eliminar conversación
- [x] Título automático basado en primer mensaje

## 🔜 Por Implementar (Roadmap)

| Funcionalidad | Prioridad | Estado |
|---------------|-----------|--------|
| Recuperar contraseña | Alta | Pendiente |
| Temas oscuro/claro | Media | Pendiente |
| Exportar conversaciones | Media | Pendiente |
| Notificaciones push | Baja | Pendiente |
| Estadísticas de ánimo | Media | Pendiente |
| Integración con calendario | Baja | Pendiente |

---

# 9. Seguridad y Privacidad

## 🔒 Medidas de Seguridad

### Autenticación
| Medida | Implementación |
|--------|----------------|
| Hashing de contraseñas | Bcrypt con salt |
| Tokens de acceso | JWT firmados (HS256) |
| Expiración de tokens | 1 hora (access), 7 días (refresh) |
| HTTPS | Obligatorio en producción |

### Base de Datos
| Medida | Implementación |
|--------|----------------|
| Conexiones seguras | SSL/TLS |
| Contraseñas no almacenadas | Solo hash |
| Inyección SQL | Prevenida por ORM |

### API
| Medida | Implementación |
|--------|----------------|
| CORS configurado | Orígenes permitidos |
| Rate limiting | Por implementar |
| Validación de entrada | GraphQL + Pydantic |

## 🔐 Privacidad

### Principios
1. **Mínimo necesario**: Solo recopilamos email y username
2. **Sin terceros**: LLM corre localmente (Ollama)
3. **Sin tracking**: No usamos analytics invasivos
4. **Derecho al olvido**: Usuario puede eliminar sus datos

### Datos Almacenados
| Dato | Propósito | Encriptado |
|------|-----------|------------|
| Email | Identificación | No (pero protegido) |
| Contraseña | Autenticación | Sí (bcrypt) |
| Mensajes | Historial | No (en BD local) |
| Conversaciones | Organización | No |

### ⚠️ Disclaimer
> SerenAI NO es un sustituto de atención médica profesional. 
> En caso de crisis o emergencia, contacta a servicios de emergencia 
> o líneas de ayuda especializadas.

---

# 10. Instalación y Despliegue

## 📋 Requisitos Previos

| Requisito | Versión Mínima |
|-----------|----------------|
| Node.js | 18.x |
| Python | 3.11 |
| Docker | 20.x |
| Docker Compose | 2.x |
| PostgreSQL | 15.x |
| Git | 2.x |

## 🚀 Instalación Paso a Paso

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/SereneIA.git
cd SereneIA
```

### 2. Configurar Chatbot (N8N + Ollama)
```bash
cd SereneIA_ChatBot
docker compose up -d
```

Esto levanta:
- N8N (puerto 5678)
- PostgreSQL (puerto 5432)
- Qdrant (puerto 6333)
- Ollama (puerto 11434)

### 3. Configurar Backend
```bash
cd ../SereneIA_BackEnd

# Crear entorno virtual
conda create -n SereneIA python=3.11
conda activate SereneIA

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Configurar Frontend
```bash
cd ../SereneIA_FrontEnd

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
echo "VITE_GRAPHQL_URI=http://localhost:8000/graphql/" > .env

# Iniciar servidor de desarrollo
npm run dev
```

### 5. Acceder a la Aplicación
- **Frontend**: http://localhost:5173
- **Backend (GraphQL)**: http://localhost:8000/graphql
- **N8N**: http://localhost:5678
- **Documentación API**: http://localhost:8000/docs

## 🌐 Despliegue en Producción

### Usando Docker (Recomendado)
```bash
# Build de producción del frontend
cd SereneIA_FrontEnd
npm run build

# Servir con nginx o similar
```

### Variables de Entorno Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql+asyncpg://user:pass@host/db` |
| `JWT_SECRET_KEY` | Clave para firmar JWT | `tu-clave-secreta-muy-larga` |
| `N8N_WEBHOOK_URL` | URL del webhook N8N | `http://localhost:5678/webhook/xxx` |
| `VITE_GRAPHQL_URI` | URL del backend GraphQL | `https://api.tudominio.com/graphql/` |

---

# 11. Casos de Uso

## 👩‍🎓 Caso 1: Estudiante Estresada

**Contexto**: María, 22 años, estudiante universitaria en época de exámenes.

**Interacción**:
```
María: "Me siento muy ansiosa por los exámenes, no puedo concentrarme 
y siento que voy a reprobar todo 😢"

SerenAI: "Entiendo lo abrumador que pueden ser los exámenes, María 💜 
Esa ansiedad que sientes es muy común y válida. 

Vamos paso a paso:

1. **Respiración 4-7-8**: Inhala 4 seg, mantén 7, exhala 8
2. **Técnica Pomodoro**: 25 min estudio, 5 min descanso
3. **Prioriza**: ¿Cuál examen es primero?

¿Qué materia te preocupa más? Podemos crear un plan juntos."
```

**Resultado**: María se siente escuchada y obtiene herramientas prácticas.

---

## 👨‍💼 Caso 2: Profesional con Burnout

**Contexto**: Carlos, 35 años, trabaja 12 horas diarias.

**Interacción**:
```
Carlos: "Trabajo demasiado y me siento vacío. No disfruto nada."

SerenAI: "Carlos, lo que describes suena a agotamiento emocional, 
y es importante que lo estés reconociendo 🙏

El burnout no es debilidad, es una señal de que has dado mucho 
sin recargarte. 

Te sugiero:
• 🚶 Un paseo de 10 min al día (sin celular)
• 📵 Horario de desconexión digital
• 💬 Hablar con alguien de confianza

Si esto continúa, considera hablar con un profesional. 
¿Hay algo que solías disfrutar y dejaste de hacer?"
```

**Resultado**: Carlos reflexiona y programa una cita con psicólogo.

---

## 👵 Caso 3: Adulto Mayor Solo

**Contexto**: Elena, 68 años, viuda, se siente sola.

**Interacción**:
```
Elena: "Mis hijos no me visitan y me siento muy sola."

SerenAI: "Elena, la soledad puede ser muy dolorosa, especialmente 
cuando extrañamos a quienes amamos 💜

Tu sentimiento es completamente válido. Algunas ideas:

• ☎️ Llamar a tus hijos (a veces ellos no saben que necesitas)
• 🏘️ Centros comunitarios para adultos mayores
• 🐱 Considerar una mascota de compañía
• 📱 Videollamadas para sentirte más cerca

¿Te gustaría hablar sobre cómo ha sido para ti este tiempo?"
```

**Resultado**: Elena se siente acompañada y motivada a actuar.

---

# 12. Futuras Mejoras

## 🗺️ Roadmap 2026-2027

### Q1 2026 (Actual)
- [x] MVP funcional
- [x] Autenticación completa
- [x] Chat con IA empática
- [ ] Tests automatizados

### Q2 2026
- [ ] App móvil (React Native)
- [ ] Modo oscuro
- [ ] Multiidioma (EN/ES/PT)
- [ ] Estadísticas de ánimo

### Q3 2026
- [ ] Ejercicios guiados (audio)
- [ ] Diario de gratitud
- [ ] Recordatorios de bienestar
- [ ] Integración con wearables

### Q4 2026
- [ ] Comunidad anónima
- [ ] Grupos de apoyo virtuales
- [ ] Recursos por categoría (ansiedad, depresión, etc.)

## 🔬 Investigación

- Explorar modelos más especializados en salud mental
- Evaluar efectividad mediante estudios piloto
- Colaboración con profesionales de salud mental

---

# 13. Equipo y Contacto

## 👥 Equipo de Desarrollo

| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| Desarrollador Full Stack | [Tu nombre] | Frontend, Backend, DevOps |
| (Agregar más miembros si aplica) | | |

## 📧 Contacto

- **Email**: contacto@serenai.com
- **GitHub**: github.com/tu-usuario/SereneIA
- **Demo**: https://serenai-demo.ngrok.io

## 📜 Licencia

Este proyecto está bajo la licencia MIT.

---

# 🙏 Agradecimientos

- A la comunidad open source por las herramientas utilizadas
- A los profesionales de salud mental que inspiraron este proyecto
- A todos los usuarios que confían en SerenAI

---

<div align="center">

## 💜 SerenAI

**Tu espacio seguro para el bienestar emocional**

*Hecho con amor y tecnología*

</div>
