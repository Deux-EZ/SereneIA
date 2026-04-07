"""
Servicio de comunicación con N8N.
Maneja el envío de mensajes al webhook del chatbot.
"""
import logging
from typing import Any, Optional
from dataclasses import dataclass

import httpx

from app.core.config import settings
from app.core.exceptions import ExternalServiceError

logger = logging.getLogger("sereneia.n8n")


@dataclass
class ChatbotResponse:
    """Respuesta del chatbot de N8N."""
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    raw_data: Optional[dict[str, Any]] = None


class N8NService:
    """
    Servicio para comunicación con N8N.
    
    Responsabilidades:
    - Enviar mensajes al webhook del chatbot
    - Manejar timeouts y errores de conexión
    - Parsear respuestas de N8N
    """
    
    def __init__(self):
        self._webhook_url = settings.n8n_webhook_url
        self._timeout = settings.n8n_timeout_seconds
    
    async def send_message(
        self,
        session_id: str,
        message: str,
        user_name: Optional[str] = None
    ) -> ChatbotResponse:
        """
        Envía un mensaje al chatbot de N8N.
        
        El session_id es el UUID del usuario, que N8N usa para
        mantener el historial de conversación en Postgres Chat Memory.
        
        Args:
            session_id: UUID del usuario (para Postgres Chat Memory en N8N)
            message: Mensaje del usuario
            user_name: Nombre del usuario (opcional, para personalizar)
            
        Returns:
            ChatbotResponse con la respuesta del LLM
        """
        payload = {
            "sessionId": session_id,
            "chatInput": message,
        }
        
        if user_name:
            payload["userName"] = user_name
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            try:
                logger.info(f"[N8N] → POST {self._webhook_url} | session={session_id[:8]}... | msg_len={len(message)}")
                response = await client.post(
                    self._webhook_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "X-API-KEY": settings.n8n_api_key
                    }
                )
                logger.info(f"[N8N] ← {response.status_code} | {len(response.content)} bytes")
                
                response.raise_for_status()
                
                # Intentar parsear como JSON
                try:
                    data = response.json()
                except Exception:
                    # Si no es JSON, tratar como texto plano
                    # N8N a veces devuelve texto plano si el "Respond to Webhook" 
                    # está configurado para devolver texto
                    text_response = response.text.strip()
                    
                    if not text_response:
                        return ChatbotResponse(
                            success=False,
                            error="El chatbot devolvió una respuesta vacía"
                        )
                    
                    # Si es texto plano, limpiar el pensamiento y devolver
                    cleaned_text = self._clean_thinking(text_response)
                    return ChatbotResponse(
                        success=True,
                        response=cleaned_text,
                        raw_data={"text": text_response}
                    )
                
                # N8N con AI Agent devuelve el output en diferentes formatos
                # Intentamos obtener la respuesta del formato más común
                assistant_response = self._extract_response(data)
                
                # Con Gemini u otros modelos avanzados, no necesitamos limpiar pensamiento
                # Solo limpiamos si es Ollama con modelos que piensan en voz alta
                # assistant_response = self._clean_thinking(assistant_response)
                
                return ChatbotResponse(
                    success=True,
                    response=assistant_response,
                    raw_data=data
                )
                
            except httpx.TimeoutException:
                return ChatbotResponse(
                    success=False,
                    error="El chatbot tardó demasiado en responder. Por favor, intenta de nuevo."
                )
            
            except httpx.HTTPStatusError as e:
                error_body = ""
                try:
                    error_body = e.response.text[:500]
                except:
                    pass
                logger.error(f"[N8N] HTTP {e.response.status_code} error | body: {error_body}")
                return ChatbotResponse(
                    success=False,
                    error=f"Error del servicio de chatbot: {e.response.status_code} - {error_body}"
                )
            
            except httpx.RequestError as e:
                return ChatbotResponse(
                    success=False,
                    error=f"No se pudo conectar con el chatbot: {str(e)}"
                )
            
            except Exception as e:
                return ChatbotResponse(
                    success=False,
                    error=f"Error inesperado: {str(e)}"
                )
    
    def _extract_response(self, data: dict[str, Any]) -> str:
        """
        Extrae la respuesta del LLM del payload de N8N.
        
        N8N puede devolver la respuesta en diferentes formatos según
        la configuración del workflow.
        
        También limpia el "pensamiento interno" que algunos modelos incluyen
        antes del mensaje final (ej: "Okay, let me think...", "Wait...", etc).
        """
        raw_response = ""
        
        # Formato 1: Respuesta directa del AI Agent
        if isinstance(data, dict):
            # El AI Agent de n8n devuelve "output" como respuesta principal
            if "output" in data:
                raw_response = str(data["output"])
            
            # Formato alternativo
            elif "response" in data:
                raw_response = str(data["response"])
            
            # Formato con message
            elif "message" in data:
                raw_response = str(data["message"])
            
            # Formato con text
            elif "text" in data:
                raw_response = str(data["text"])
        
        # Si es una lista, tomar el primer elemento
        elif isinstance(data, list) and len(data) > 0:
            first_item = data[0]
            if isinstance(first_item, dict):
                raw_response = self._extract_response(first_item)
            else:
                raw_response = str(first_item)
        
        # Si no se encontró nada, fallback
        if not raw_response:
            raw_response = str(data)
        
        # Limpiar el pensamiento interno del modelo
        return self._clean_thinking(raw_response)
    
    def _clean_thinking(self, text: str) -> str:
        """
        Limpia el pensamiento interno del modelo (chain-of-thought).
        
        Los modelos a veces incluyen su razonamiento interno antes de la respuesta:
        "Okay, el usuario dijo... Let me think... So the response is: ¡Hola!..."
        
        Esta función extrae solo el mensaje final para el usuario.
        
        IMPORTANTE: Solo limpiamos si detectamos pensamiento explícito al inicio.
        No cortamos por saltos de línea porque las respuestas legítimas pueden tenerlos.
        """
        import re
        
        # Si el texto está vacío, devolverlo tal cual
        if not text or not text.strip():
            return text
        
        # Solo limpiar si el texto COMIENZA con indicadores de pensamiento
        text_stripped = text.strip()
        if not self._is_thinking(text_stripped[:100]):  # Solo revisar los primeros 100 chars
            # No hay pensamiento, devolver el texto completo preservando formato
            return text_stripped
        
        # Si hay pensamiento al inicio, intentar extraer la respuesta real
        
        # Patrón 1: Buscar después de frases como "So the response..."
        patterns = [
            r'(?:So (?:the|my) (?:response|answer)(?: should be| is)?:?\s*["\']?)(.+?)(?:["\']?\s*$)',
            r'(?:The (?:correct|final) (?:response|answer)(?: should be| is)?:?\s*["\']?)(.+?)(?:["\']?\s*$)',
            r'(?:I (?:think|should say|will respond):?\s*["\']?)(.+?)(?:["\']?\s*$)',
            r'(?:Let me (?:respond|say):?\s*["\']?)(.+?)(?:["\']?\s*$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        # Si no encontramos un patrón claro, buscar el primer párrafo que no sea pensamiento
        if '\n\n' in text:
            parts = text.split('\n\n')
            # Encontrar el primer párrafo que NO sea pensamiento
            for i, part in enumerate(parts):
                clean_part = part.strip()
                if clean_part and not self._is_thinking(clean_part[:50]):
                    # Devolver desde este punto en adelante (incluyendo párrafos posteriores)
                    return '\n\n'.join(parts[i:]).strip()
        
        # Si todo parece pensamiento pero hay una última línea distinta, devolverla
        lines = text_stripped.split('\n')
        if len(lines) > 1:
            last_line = lines[-1].strip()
            if last_line and not self._is_thinking(last_line[:50]):
                return last_line
        
        # Fallback: devolver todo el texto
        return text_stripped
    
    def _is_thinking(self, text: str) -> bool:
        """
        Detecta si un texto es pensamiento interno en lugar de respuesta.
        
        Args:
            text: Texto a analizar
            
        Returns:
            True si parece ser pensamiento interno
        """
        thinking_indicators = [
            'okay,', 'wait,', 'let me think', 'let me check',
            'i need to', 'i should', 'the user said', 'the user is',
            'first,', 'so the response', 'so i', 'hmm,',
            'the instructions say', 'the system says', 'the problem',
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in thinking_indicators)
    
    async def health_check(self) -> bool:
        """
        Verifica si el servicio de N8N está disponible.
        
        Returns:
            True si N8N responde, False en caso contrario
        """
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                # Intentar acceder al health endpoint de N8N
                health_url = f"{settings.n8n_base_url}/healthz"
                response = await client.get(health_url)
                return response.status_code == 200
            except Exception:
                return False
    
    async def get_conversation_history(
        self,
        session_id: str
    ) -> list[dict]:
        """
        Obtiene el historial de mensajes de una conversación.
        Lee directamente de la tabla n8n_chat_histories.
        
        NOTA: Esta tabla está en la BD 'n8n', no en 'sereneia_users'.
        Requiere una conexión separada a esa BD.
        
        La tabla tiene solo: id, session_id, message (JSONB)
        NO tiene created_at
        
        Args:
            session_id: UUID de la conversación como string
            
        Returns:
            Lista de mensajes con id, type, content
        """
        import asyncpg
        import json
        from datetime import datetime
        
        print(f"[DEBUG] Getting history for session_id: {session_id}")
        
        # Construir URL para la BD de N8N
        n8n_db_url = settings.database_url.replace(
            "postgresql+asyncpg://", 
            "postgresql://"
        ).replace(
            "sereneia_users",
            "n8n"
        )
        
        print(f"[DEBUG] N8N DB URL (masked): {n8n_db_url.split('@')[0]}@***")
        
        try:
            conn = await asyncpg.connect(n8n_db_url)
            try:
                # La tabla n8n_chat_histories solo tiene:
                # id, session_id, message (JSONB)
                # NO tiene created_at
                rows = await conn.fetch(
                    """
                    SELECT id, session_id, message
                    FROM n8n_chat_histories
                    WHERE session_id = $1
                    ORDER BY id ASC
                    """,
                    session_id
                )
                
                print(f"[DEBUG] Found {len(rows)} messages for session_id: {session_id}")
                
                messages = []
                for row in rows:
                    msg_raw = row["message"]
                    
                    # El campo message puede venir como string JSON o como dict
                    if isinstance(msg_raw, str):
                        try:
                            msg_data = json.loads(msg_raw)
                        except json.JSONDecodeError:
                            print(f"[DEBUG] Failed to parse message: {msg_raw[:100]}")
                            continue
                    else:
                        msg_data = msg_raw
                    
                    print(f"[DEBUG] Raw message: {msg_data}")
                    
                    # El formato del mensaje en N8N puede ser:
                    # Formato 1: {"type": "human"|"ai", "content": "..."}
                    # Formato 2: {"type": "human"|"ai", "data": {"content": "..."}}
                    if isinstance(msg_data, dict):
                        msg_type = msg_data.get("type", "human")
                        
                        # Intentar obtener contenido directamente primero
                        content = msg_data.get("content", "")
                        
                        # Si no hay contenido directo, buscar en data.content
                        if not content:
                            content = msg_data.get("data", {}).get("content", "")
                        
                        if content:  # Solo agregar si hay contenido
                            messages.append({
                                "id": row["id"],
                                "type": msg_type,
                                "content": content,
                                # Usar timestamp actual como placeholder ya que no hay created_at
                                "created_at": datetime.now(),
                            })
                
                print(f"[DEBUG] Processed {len(messages)} messages")
                return messages
                
            finally:
                await conn.close()
                
        except Exception as e:
            # Si falla la conexión, retornar lista vacía
            # En producción deberías loguear este error
            print(f"Error reading N8N chat history: {e}")
            return []


# Instancia singleton del servicio
n8n_service = N8NService()
