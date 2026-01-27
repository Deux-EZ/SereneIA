"""
Servicio de comunicación con N8N.
Maneja el envío de mensajes al webhook del chatbot.
"""
from typing import Any, Optional
from dataclasses import dataclass

import httpx

from app.core.config import settings
from app.core.exceptions import ExternalServiceError


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
                response = await client.post(
                    self._webhook_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                
                # N8N con AI Agent devuelve el output en diferentes formatos
                # Intentamos obtener la respuesta del formato más común
                assistant_response = self._extract_response(data)
                
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
                return ChatbotResponse(
                    success=False,
                    error=f"Error del servicio de chatbot: {e.response.status_code}"
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
        """
        # Formato 1: Respuesta directa del AI Agent
        if isinstance(data, dict):
            # El AI Agent de n8n devuelve "output" como respuesta principal
            if "output" in data:
                return str(data["output"])
            
            # Formato alternativo
            if "response" in data:
                return str(data["response"])
            
            # Formato con message
            if "message" in data:
                return str(data["message"])
            
            # Formato con text
            if "text" in data:
                return str(data["text"])
        
        # Si es una lista, tomar el primer elemento
        if isinstance(data, list) and len(data) > 0:
            first_item = data[0]
            if isinstance(first_item, dict):
                return self._extract_response(first_item)
            return str(first_item)
        
        # Fallback: convertir todo a string
        return str(data)
    
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


# Instancia singleton del servicio
n8n_service = N8NService()
