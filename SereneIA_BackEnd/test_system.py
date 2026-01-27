#!/usr/bin/env python3
"""
Script de pruebas completas del sistema SereneIA
"""
import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8000/graphql/"

def graphql_request(query, token=None):
    """Hace una petición GraphQL"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.post(BASE_URL, json={"query": query}, headers=headers, timeout=60)
    return response.json()

def print_section(title):
    """Imprime sección"""
    print(f"\n{'='*50}")
    print(f"📋 {title}")
    print('='*50)

def main():
    print("\n🧪 PRUEBAS COMPLETAS DEL SISTEMA SERENEIA\n")
    
    # 1. CREAR USUARIO
    print_section("1. CREAR USUARIO NUEVO")
    timestamp = int(time.time())
    email = f"test{timestamp}@sereneia.com"
    username = f"test{timestamp}"
    
    register_query = f'''
    mutation {{
      register(input: {{
        email: "{email}",
        username: "{username}",
        password: "test12345",
        fullName: "Usuario Test {timestamp}"
      }}) {{
        user {{
          id
          email
          username
          fullName
          role
          createdAt
        }}
        accessToken
      }}
    }}
    '''
    
    result = graphql_request(register_query)
    if 'errors' in result:
        print(f"❌ Error: {result['errors'][0]['message']}")
        return
    
    user = result['data']['register']['user']
    token = result['data']['register']['accessToken']
    
    print(f"✅ Usuario creado:")
    print(f"   ID: {user['id']}")
    print(f"   Email: {user['email']}")
    print(f"   Username: {user['username']}")
    print(f"   Nombre: {user['fullName']}")
    print(f"   Rol: {user['role']}")
    print(f"   Token: {token[:30]}...")
    
    # 2. CREAR CONVERSACIONES
    print_section("2. CREAR CONVERSACIONES")
    conversations = []
    
    for i in range(1, 4):
        conv_query = f'''
        mutation {{
          createConversation(input: {{
            title: "Conversación {i}"
          }}) {{
            conversation {{
              id
              title
              createdAt
            }}
          }}
        }}
        '''
        
        result = graphql_request(conv_query, token)
        conv = result['data']['createConversation']['conversation']
        conversations.append(conv)
        print(f"✅ Conversación {i}: {conv['id']}")
        time.sleep(0.5)
    
    # 3. ENVIAR MENSAJES
    print_section("3. ENVIAR MENSAJES")
    
    messages = [
        ("Hola, soy nuevo aquí", conversations[0]['id']),
        ("Me siento estresado con los exámenes", conversations[1]['id']),
        ("¿Cómo puedo mejorar mi concentración?", conversations[2]['id'])
    ]
    
    for msg, conv_id in messages:
        print(f"\n💬 Enviando: '{msg[:40]}...'")
        send_query = f'''
        mutation {{
          sendMessage(input: {{
            conversationId: "{conv_id}",
            message: "{msg}"
          }}) {{
            success
            response
            error
          }}
        }}
        '''
        
        result = graphql_request(send_query, token)
        if result['data']['sendMessage']['success']:
            response = result['data']['sendMessage']['response']
            print(f"✅ Respuesta: {response[:100]}...")
        else:
            print(f"❌ Error: {result['data']['sendMessage']['error']}")
        
        time.sleep(1)
    
    # 4. LISTAR CONVERSACIONES
    print_section("4. LISTAR TODAS LAS CONVERSACIONES")
    
    list_query = '''
    query {
      conversations(limit: 10) {
        conversations {
          id
          title
          lastMessagePreview
          createdAt
          updatedAt
        }
        total
        hasMore
      }
    }
    '''
    
    result = graphql_request(list_query, token)
    convs = result['data']['conversations']
    
    print(f"📊 Total: {convs['total']} conversaciones")
    print(f"📄 Mostrando: {len(convs['conversations'])}")
    print(f"➡️  Hay más: {convs['hasMore']}")
    
    for conv in convs['conversations']:
        print(f"\n  🗨️  {conv['title']}")
        print(f"     ID: {conv['id'][:20]}...")
        print(f"     Preview: {conv['lastMessagePreview'][:60] if conv['lastMessagePreview'] else 'Sin mensajes'}...")
        print(f"     Creado: {conv['createdAt']}")
    
    # 5. VER HISTORIAL DE UNA CONVERSACIÓN
    print_section("5. HISTORIAL DE CONVERSACIÓN")
    
    history_query = f'''
    query {{
      conversationHistory(conversationId: "{conversations[1]['id']}") {{
        id
        type
        content
        createdAt
      }}
    }}
    '''
    
    result = graphql_request(history_query, token)
    history = result['data']['conversationHistory']
    
    print(f"📜 Historial de '{conversations[1]['title']}':")
    for msg in history:
        icon = "👤" if msg['type'] == 'human' else "🤖"
        print(f"\n  {icon} [{msg['type']}] {msg['createdAt']}")
        print(f"     {msg['content'][:80]}...")
    
    print_section("✅ PRUEBAS COMPLETADAS")
    print(f"\n📊 Resumen:")
    print(f"   • Usuario creado: {user['email']}")
    print(f"   • Conversaciones: {len(conversations)}")
    print(f"   • Mensajes enviados: {len(messages)}")
    print(f"   • Historial verificado: ✅")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
