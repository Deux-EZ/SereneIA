import React from 'react';
import { Card, Button } from './Common';
import { Database, Code, Zap } from 'lucide-react';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  technologies: string[];
  responsibilities: string[];
  integrations: string;
  color: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  icon,
  title,
  technologies,
  responsibilities,
  integrations,
  color,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center gap-3 mb-4">
      <div style={{ color }}>{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>

    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🛠️ Tecnologías</h4>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
            {tech}
          </span>
        ))}
      </div>
    </div>

    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">✅ Responsabilidades</h4>
      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        {responsibilities.map((resp, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-primary dark:text-secondary mt-1">•</span>
            <span>{resp}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-semibold">🔗 Integración:</span> {integrations}
      </p>
    </div>
  </div>
);

export const ModulesDocumentation: React.FC = () => {
  const modules = [
    {
      icon: <Code size={32} />,
      title: 'Frontend',
      color: '#6366f1',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Apollo Client'],
      responsibilities: [
        'Interfaz de chatbot en tiempo real',
        'Gestión de login/cierre de sesión',
        'Visualización de historial de chats',
        'Manejo de estados y notificaciones',
        'Seguridad en almacenamiento de tokens',
      ],
      integrations: 'Llama a endpoints GraphQL del Backend',
    },
    {
      icon: <Zap size={32} />,
      title: 'Backend',
      color: '#8b5cf6',
      technologies: ['FastAPI', 'Strawberry (GraphQL)', 'JWT', 'PostgreSQL'],
      responsibilities: [
        'Autenticación y autorización',
        'Orquestación de solicitudes al servicio de chatbot',
        'Persistencia de historial de chats',
        'Validación de datos y control de acceso',
        'Gestión de sesiones y auditoría de eventos',
      ],
      integrations: 'Expone API GraphQL; consume webhook del Servicio Chatbot',
    },
    {
      icon: <Database size={32} />,
      title: 'Servicio Chatbot',
      color: '#ec4899',
      technologies: ['n8n', 'Ollama (Qwen3:4b)', 'PostgreSQL'],
      responsibilities: [
        'Procesamiento de prompts con LLM',
        'Gestión de contexto de conversación',
        'Integración con fuentes de datos externas',
        'Orquestación de flujos conversacionales',
        'Registro de logs de auditoría',
      ],
      integrations: 'Recibe prompts vía webhook; devuelve respuestas al Backend',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Título */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Arquitectura de SereneIA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Sistema modular integrado para procesamiento de lenguaje natural
        </p>
      </div>

      {/* Data Flow */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/30 dark:border-secondary/30">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📊 Flujo de Datos</h2>
        <div className="flex items-center justify-between text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded whitespace-nowrap">Frontend</span>
          <span className="text-lg mx-2">→ GraphQL →</span>
          <span className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-3 py-1 rounded whitespace-nowrap">Backend</span>
          <span className="text-lg mx-2">→ Webhook →</span>
          <span className="bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 px-3 py-1 rounded whitespace-nowrap">Chatbot</span>
          <span className="text-lg mx-2">→ Response →</span>
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 px-3 py-1 rounded whitespace-nowrap">Frontend</span>
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module, idx) => (
          <ModuleCard key={idx} {...module} />
        ))}
      </div>

      {/* General Features */}
      <Card className="border-l-4 border-accent">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔧 Módulo General</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🌐 Gestión de Configuración</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Centraliza variables de entorno (API keys, URLs, timeouts) usando pydantic-settings (Backend) y .env (Frontend).
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ 12-factor app</li>
              <li>✅ Separación estricta de ambientes (dev/staging/prod)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Logging y Monitoreo</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Registra métricas y errores en Backend (structlog + ELK Stack) y Frontend (Sentry + Datadog RUM).
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ OpenTelemetry para trazas distribuidas</li>
              <li>✅ Alertas proactivas en Prometheus/Grafana</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🔐 Comunicación Segura</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              TLS 1.3 en todas las APIs, validación de esquemas, CORS restringido.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ JWT con expiración corta</li>
              <li>✅ Rate limiting con Redis</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🗄️ Base de Datos Central</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              PostgreSQL 15+ como única fuente de verdad.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ ACID compliance</li>
              <li>✅ Particionamiento por user_id</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Authentication Flow */}
      <Card className="border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔑 Módulo de Usuarios</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🚀 Autenticación</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li>El usuario ingresa sus credenciales en el Frontend</li>
              <li>Se envía una mutación GraphQL <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">login(username, password)</code> al Backend</li>
              <li>Backend valida contra PostgreSQL y genera JWT con claims</li>
              <li>Token se almacena en HttpOnly Cookie para máxima seguridad</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✨ Autorización</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Control de acceso según roles (user, admin) mediante directivas GraphQL y middlewares en FastAPI.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cierre de sesión invalida el token en lista negra (Redis) hasta su expiración.
            </p>
          </div>
        </div>
      </Card>

      {/* Chat Entity Module */}
      <Card className="border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💬 Módulo de Entidades (Conversaciones)</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🤖 Motor de Conversación</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li>Backend envía prompt al webhook de n8n</li>
              <li>n8n determina si es nuevo contexto o continuación</li>
              <li>Se recupera historial de conversación desde PostgreSQL</li>
              <li>Se llama al modelo LLM Ollama (Qwen3:4b)</li>
              <li>Se post-procesa y almacena la respuesta</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Persistencia</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Todas las conversaciones y mensajes se almacenan en PostgreSQL con esquema optimizado:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
              <div>CREATE TABLE conversations (...)</div>
              <div>CREATE TABLE messages (...)</div>
              <div className="text-green-600 dark:text-green-400 mt-2">→ Índices BRIN y particionamiento optimizado</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Standards */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-300 dark:border-yellow-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📋 Estándares Aplicados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🛡️ Seguridad</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>✅ OWASP Top 10 mitigado</li>
              <li>✅ Sanitización contra prompt injection</li>
              <li>✅ JWT HS512 con rotación 90 días</li>
              <li>✅ HttpOnly cookies y SameSite</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⚡ Escalabilidad</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>✅ Workers asincronos (Uvicorn + Gunicorn)</li>
              <li>✅ Escalado horizontal de Ollama en K8s</li>
              <li>✅ Particionamiento en PostgreSQL</li>
              <li>✅ Rate limiting con Redis</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
