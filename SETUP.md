# Configuración de Relay16

## Variables de Entorno

Para usar las funcionalidades de IA de Relay16, necesitas configurar las siguientes variables de entorno:

### 1. Copia el archivo de ejemplo
```bash
cp env.example .env
```

### 2. Configura tu API Key de OpenRouter

1. Ve a [OpenRouter](https://openrouter.ai/) y crea una cuenta
2. Obtén tu API key desde el dashboard
3. Edita el archivo `.env` y reemplaza `sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` con tu API key real

```env
# OpenRouter AI Configuration
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# AI Model Settings
VITE_OPENROUTER_DEFAULT_MODEL=nvidia/llama-3.1-nemotron-ultra-253b-v1:free
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Site Information (required by OpenRouter)
VITE_OPENROUTER_SITE_URL=https://relay16.app
VITE_OPENROUTER_SITE_NAME=Relay16
```

### 3. Variables Disponibles

- `VITE_OPENROUTER_API_KEY`: Tu API key de OpenRouter (requerida)
- `VITE_OPENROUTER_DEFAULT_MODEL`: Modelo de IA por defecto (opcional, default: openai/gpt-3.5-turbo)
- `VITE_APP_NAME`: Nombre de la aplicación (opcional, default: Relay16)
- `VITE_DEFAULT_RELAYS`: Relays de Nostr por defecto (opcional)

## Estructura de Rutas

La aplicación usa las siguientes rutas:

- `/` - Página de inicio (landing)
- `/login` - Página de login
- `/feed` - Feed principal de Nostr
- `/profile/:pubkey?` - Perfil de usuario (opcional pubkey)
- `/compose` - Crear nueva nota
- `/tools` - Herramientas de IA
- `/settings` - Configuración

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Verificar tipos TypeScript
npm run type-check
```

## Funcionalidades de IA

Una vez configurada la API key, tendrás acceso a:

1. **Asistente de Escritura**: Mejora tus posts con sugerencias de IA
2. **Moderador de Contenido**: Analiza contenido para detectar spam y toxicidad
3. **Resumidor de Conversaciones**: Resume hilos largos automáticamente
4. **Generador de Hashtags**: Genera hashtags relevantes para tus posts

## Notas Importantes

- Las API keys se almacenan localmente en tu navegador
- Nunca compartas tu archivo `.env` en repositorios públicos
- El archivo `.env` está incluido en `.gitignore` por seguridad 