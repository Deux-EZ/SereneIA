# 🚀 Proyecto de Automatización con n8n, PostgreSQL y Qdrant

¡Bienvenido! 👋 Este proyecto es un entorno robusto diseñado para manejar flujos de trabajo avanzados de automatización con **n8n**, **PostgreSQL** y **Qdrant**. 🛠️ Aquí encontrarás toda la información relevante, las funcionalidades principales y una guía para configurar este entorno en tu sistema local.

---

## 🧐 ¿Qué hace este proyecto?

### Funcionalidades principales:
- **n8n**: Orquesta flujos de trabajo automatizados para conectar servicios, realizar transformaciones de datos y más. 🔄
- **PostgreSQL**: Sirve como base de datos para almacenar credenciales y metadatos de flujos. 💾
- **Qdrant**: Proporciona una base de datos vectorial para realizar búsquedas de alta dimensión, ideal para proyectos de inteligencia artificial o recuperación guiada de información (RAG). 🔍
- **Importación Automática**: Permite importar credenciales y flujos automáticamente al desplegar n8n. 📥

---

## 📂 Estructura del Proyecto

Este entorno utiliza **Docker Compose** para orquestar los servicios necesarios:

### Volúmenes
- `n8n_storage`: Almacena los datos y configuraciones de n8n. 📦
- `postgres_storage`: Persiste los datos de PostgreSQL. 📦
- `qdrant_storage`: Persiste la información almacenada en Qdrant. 📦

### Servicios
1. **PostgreSQL**: 
   - Imagen: `postgres:16-alpine`
   - Persistencia: `/var/lib/postgresql/data` 🗄️

2. **n8n-import**: 
   - Importa automáticamente credenciales y flujos desde la carpeta `backup`. 🔄

3. **n8n**:
   - La herramienta principal de automatización.
   - Configurada para personalización completa (plugins de Python, entorno seguro). 🔧

4. **Qdrant**:
   - Base de datos vectorial, ideal para búsqueda y recuperación de información basada en vectores. 🎯

### Red
- **Red compartida `oms-prod-n8n`**: Conecta todos los servicios. 🔗

---

## ⚙️ Configuración del Entorno Local

Sigue estos pasos para desplegar el proyecto en tu máquina local:

### 1. Requisitos previos 🛠️
- Tener **Docker** y **Docker Compose** instalados en tu sistema. 🐳
- Puerto **5678** disponible para acceder a n8n.
- Puerto **6333** disponible para Qdrant.

### 2. Clonar el Repositorio 🧑‍💻
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 3. Crear un Archivo .env 🗂️
Crea un archivo .env en la raíz del proyecto con las siguientes variables de entorno:

```
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_contraseña
POSTGRES_DB=tu_base_datos
N8N_ENCRYPTION_KEY=tu_llave_encriptacion
N8N_USER_MANAGEMENT_JWT_SECRET=tu_secreto_jwt
N8N_RELEASE_DATE=fecha_de_referencia
```

### 4. Iniciar los Servicios 🚀
Ejecuta el siguiente comando para desplegar el entorno:

```bash
docker-compose up -d
```

### 5. Acceder a los Servicios 🌐

- **n8n:** [http://localhost:5678](http://localhost:5678)
- **Qdrant:** [http://localhost:6333](http://localhost:6333)


## Licencia

Este proyecto está bajo la licencia MIT. Siéntete libre de usarlo y adaptarlo según tus necesidades. 📄

## Colaboración

Para contribuir y subir tus aportes, sigue estos pasos:

1. **Clona el repositorio:**  
   Utiliza el comando `git clone` para clonar el repositorio en tu máquina local.

2. **Crea una rama:**  
   Antes de realizar cambios, crea una rama con un nombre descriptivo, por ejemplo:
   
   ```bash
   git checkout -b mejora-documentacion
   ```

3. **Realiza cambios en los workflows**
    Crea un nuevo flujo de trabajo, edita los existentes, agrega una funcionalidad nueva o soluciona bugs que hayas encontrado.

4. **Exportar cambios**

    En la terminal se tendrá que ejecutar el siguiente comando:
    ```bash
    docker exec -ti n8n n8n export:workflow --all --separate --output=/backup/workflows

    docker exec -ti n8n n8n export:credentials --all --separate --output=/backup/credentials
    ```
    Así exportamos la nueva información de las credenciales y los flujos de trabajo que hayamos agregado y sean importantes para su correcto funcionamiento.

5. **Sube los cambios a tu rama**
    
    Se generaran nuevos archivos en los cuales estarán reflejados en el repositorio, solo queda realizar los correspondientes commits y abrir una *Pull Request* ⛱️
    

## 🛡️ Seguridad
Este entorno está configurado con parámetros de seguridad avanzados:
```bash
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
```
Uso de claves de encriptación con N8N_ENCRYPTION_KEY. 🔐


## 📚 Recursos Adicionales
- [Documentación oficial de n8n 📖](https://docs.n8n.io/)
- [Documentación de Qdrant 📖](https://qdrant.tech/documentation/)
- [PostgreSQL Official Docs 📖](https://www.postgresql.org/docs/)
- [Documentación CLI oficial de n8n 📖](https://docs.n8n.io/hosting/cli-commands/#start-a-workflow)


🎉 ¡Y eso es todo! Ahora tienes un entorno poderoso para manejar flujos de trabajo avanzados. Si necesitas ayuda, no dudes en preguntar. ¡Manos a la obra! 🚀