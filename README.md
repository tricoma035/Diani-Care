# Sistema de Gestión Hospitalaria - Kenia

## Descripción General

Sistema completo de gestión de pacientes para hospitales en Kenia, desarrollado con Next.js, TypeScript, Supabase y Tailwind CSS. La aplicación permite gestionar pacientes, archivos médicos, notas clínicas y cuenta con un chatbot inteligente para consultas.

## Características Principales

### 🔐 Sistema de Autenticación

- **Registro y Login**: Sistema completo de autenticación con Supabase Auth
- **Roles de Usuario**: Director, Médico, Asistente
- **Hospitales Soportados**: 6 hospitales en la región de Ukunda y Kwale County
- **Cambio de Contraseña**: Funcionalidad para usuarios que deben cambiar su contraseña inicial

### 👥 Gestión de Pacientes

- **Crear Pacientes**: Formulario completo con validaciones
- **Editar Pacientes**: Modificación de datos existentes
- **Eliminar Pacientes**: Con confirmación y registro de auditoría
- **Búsqueda Avanzada**: Por nombre o número de identificación
- **Ordenamiento**: Por nombre o fecha de creación
- **Vista Detallada**: Información completa del paciente

### 📋 Notas Médicas

- **Crear Notas**: Diagnóstico, tratamiento y observaciones
- **Editar Notas**: Modificación de notas existentes
- **Eliminar Notas**: Con confirmación
- **Historial Completo**: Todas las notas del paciente ordenadas por fecha
- **Información del Médico**: Muestra quién creó cada nota

### 📁 Gestión de Archivos

- **Subida de Archivos**: Drag & drop o selección manual
- **Tipos Soportados**: PDF, DOCX, TXT, imágenes (JPG, PNG, GIF)
- **Tamaño Máximo**: 10MB por archivo
- **Extracción de Contenido**: OCR para imágenes, extracción de texto de PDFs y DOCX
- **Descarga de Archivos**: Acceso directo a los archivos subidos
- **Eliminación Segura**: Borrado tanto del storage como de la base de datos

### 🤖 Chatbot Inteligente

- **Dos Modos de Consulta**:
  - **Base de Datos**: Consultas sobre pacientes, archivos y notas médicas
  - **Internet**: Búsquedas en tiempo real sobre información médica
- **Conversaciones Persistentes**: Guardado automático de conversaciones
- **Gestión de Conversaciones**: Crear, editar, eliminar conversaciones
- **Multilingüe**: Soporte para español, inglés y swahili
- **Análisis de Archivos**: El chatbot puede leer y analizar el contenido de los archivos subidos

### 🌍 Internacionalización

- **Tres Idiomas**: Español, Inglés, Swahili
- **Interfaz Completa**: Todos los textos traducidos
- **Selector de Idioma**: Cambio dinámico sin recargar la página
- **Formateo de Fechas**: Según el idioma seleccionado

### 📊 Auditoría y Seguridad

- **Logs de Modificación**: Registro de todas las ediciones y eliminaciones
- **RLS (Row Level Security)**: Seguridad a nivel de fila en Supabase
- **Políticas de Acceso**: Control granular de permisos
- **Validaciones**: Frontend y backend para prevenir errores

## Tecnologías Utilizadas

### Frontend

- **Next.js 14**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Framework de estilos utilitarios
- **Lucide React**: Iconografía moderna
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas

### Backend

- **Supabase**: Base de datos PostgreSQL y autenticación
- **PostgreSQL**: Base de datos relacional
- **Supabase Storage**: Almacenamiento de archivos
- **Edge Functions**: Funciones serverless (futuro)

### APIs Externas

- **OpenAI GPT-4**: Chatbot inteligente
- **Serper API**: Búsquedas en internet
- **Tesseract.js**: OCR para imágenes
- **PDF-parse**: Extracción de texto de PDFs
- **Mammoth**: Extracción de texto de DOCX

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── chatbot-openai/ # Endpoint del chatbot
│   │   └── process-file/   # Procesamiento de archivos
│   ├── auth/              # Páginas de autenticación
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── Chatbot.tsx        # Chatbot principal
│   ├── Dashboard.tsx      # Panel principal
│   ├── PatientDetail.tsx  # Vista detallada de paciente
│   ├── PatientList.tsx    # Lista de pacientes
│   ├── PatientModal.tsx   # Modal de paciente
│   ├── NoteModal.tsx      # Modal de notas
│   ├── FileUploadModal.tsx # Modal de subida de archivos
│   ├── LoginPage.tsx      # Página de login
│   ├── LanguageSelector.tsx # Selector de idioma
│   └── LoadingFallback.tsx # Componente de carga
├── contexts/              # Contextos de React
│   └── AuthContext.tsx    # Contexto de autenticación
└── lib/                   # Utilidades y configuraciones
    ├── i18n.tsx          # Sistema de internacionalización
    └── supabase.ts       # Configuración de Supabase
```

## Base de Datos

### Tablas Principales

#### `users`

- Información de usuarios del sistema
- Roles: Director, Médico, Asistente
- Hospital asignado
- Campos de seguridad

#### `patients`

- Datos de pacientes
- Información personal y médica
- Relación con hospital y usuario creador

#### `patient_notes`

- Notas médicas de pacientes
- Diagnóstico, tratamiento, observaciones
- Relación con paciente y médico

#### `patient_files`

- Archivos adjuntos de pacientes
- URLs de storage
- Metadatos de subida

#### `file_contents`

- Contenido extraído de archivos
- Texto procesado por OCR/extracción
- Chunks para archivos grandes

#### `chatbot_conversations`

- Conversaciones del chatbot
- Mensajes en formato JSON
- Relación con usuario

#### `modification_logs`

- Logs de auditoría
- Cambios en pacientes
- Información de quién y cuándo

### Funciones y Triggers

#### Triggers de Auditoría

- **patient_modification_trigger**: Registra cambios en pacientes
- **note_modification_trigger**: Registra cambios en notas
- **file_modification_trigger**: Registra cambios en archivos

#### Funciones de Validación

- **validate_patient_data**: Valida datos de pacientes
- **validate_note_data**: Valida datos de notas
- **validate_file_upload**: Valida subidas de archivos

## Flujo de Funcionamiento

### 1. Autenticación

1. Usuario accede a la aplicación
2. Si no está autenticado, ve la página de login
3. Puede registrarse o iniciar sesión
4. Se valida contra Supabase Auth
5. Se crea/actualiza registro en tabla `users`
6. Redirección al dashboard

### 2. Gestión de Pacientes

1. **Crear Paciente**:

   - Usuario hace clic en "Agregar Paciente"
   - Se abre modal con formulario
   - Validación en frontend y backend
   - Se guarda en tabla `patients`
   - Se registra en logs de auditoría

2. **Editar Paciente**:

   - Usuario selecciona paciente de la lista
   - Se abre modal con datos pre-llenados
   - Modificación de campos
   - Actualización en base de datos
   - Registro de cambios en auditoría

3. **Eliminar Paciente**:
   - Confirmación de eliminación
   - Borrado de paciente y datos relacionados
   - Registro en logs de auditoría

### 3. Gestión de Notas Médicas

1. **Crear Nota**:

   - Desde vista detallada del paciente
   - Formulario con diagnóstico, tratamiento, observaciones
   - Guardado con relación al paciente y médico
   - Actualización automática de la vista

2. **Editar/Eliminar Nota**:
   - Botones en cada nota
   - Confirmación para eliminación
   - Actualización inmediata

### 4. Gestión de Archivos

1. **Subida de Archivo**:

   - Modal de subida con drag & drop
   - Validación de tipo y tamaño
   - Subida a Supabase Storage
   - Registro en tabla `patient_files`
   - Procesamiento automático de contenido
   - Extracción de texto y almacenamiento en `file_contents`

2. **Descarga de Archivo**:

   - Botón de descarga en cada archivo
   - Descarga directa desde storage
   - Nombre original preservado

3. **Eliminación de Archivo**:
   - Confirmación de eliminación
   - Borrado de storage y base de datos
   - Limpieza de contenido extraído

### 5. Chatbot

1. **Modo Base de Datos**:

   - Usuario selecciona modo "Base de Datos"
   - Pregunta sobre paciente específico
   - Sistema busca paciente por nombre/ID
   - Recopila información de paciente, notas y archivos
   - Envía contexto completo a OpenAI
   - Responde con información específica del paciente

2. **Modo Internet**:

   - Usuario selecciona modo "Internet"
   - Pregunta sobre información médica general
   - Sistema busca en internet usando Serper API
   - Recopila resultados de múltiples fuentes
   - Envía información actualizada a OpenAI
   - Responde con información de internet

3. **Gestión de Conversaciones**:
   - Guardado automático de conversaciones
   - Lista de conversaciones anteriores
   - Edición de títulos
   - Eliminación de conversaciones

## Configuración del Entorno

### Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key

# Serper (para búsquedas en internet)
SERPER_API_KEY=tu_serper_api_key
```

### Dependencias Principales

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "lucide-react": "^0.294.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0",
  "tesseract.js": "^4.1.1"
}
```

## Instalación y Despliegue

### 1. Clonar el Repositorio

```bash
git clone [url-del-repositorio]
cd app-hospital-kenia
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 4. Configurar Supabase

- Crear proyecto en Supabase
- Ejecutar migraciones de base de datos
- Configurar políticas RLS
- Crear bucket de storage

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

### 6. Desplegar en Producción

```bash
npm run build
npm start
```

## Características de Seguridad

### Autenticación y Autorización

- **Supabase Auth**: Sistema robusto de autenticación
- **JWT Tokens**: Manejo seguro de sesiones
- **RLS Policies**: Control de acceso a nivel de base de datos
- **Validación de Roles**: Verificación de permisos por rol

### Protección de Datos

- **Encriptación**: Datos sensibles encriptados
- **Validación**: Frontend y backend
- **Sanitización**: Prevención de inyección SQL
- **Auditoría**: Logs completos de cambios

### Seguridad de Archivos

- **Validación de Tipos**: Solo archivos permitidos
- **Límites de Tamaño**: Prevención de ataques DoS
- **Almacenamiento Seguro**: Supabase Storage con políticas
- **Acceso Controlado**: URLs temporales y seguras

## Mantenimiento y Escalabilidad

### Monitoreo

- **Logs de Supabase**: Monitoreo de base de datos
- **Logs de Aplicación**: Errores y eventos importantes
- **Métricas de Uso**: Estadísticas de usuarios y archivos

### Backup y Recuperación

- **Backup Automático**: Supabase maneja backups automáticos
- **Versionado**: Control de versiones con Git
- **Rollback**: Capacidad de revertir cambios

### Escalabilidad

- **Arquitectura Serverless**: Escalado automático
- **CDN**: Distribución global de contenido
- **Optimización**: Lazy loading y code splitting

## Soporte y Contribución

### Reportar Problemas

- Usar el sistema de issues del repositorio
- Incluir información detallada del problema
- Adjuntar logs y capturas de pantalla

### Contribuir

- Fork del repositorio
- Crear rama para nueva funcionalidad
- Seguir estándares de código
- Crear pull request con descripción detallada

### Documentación

- Código comentado en español
- README actualizado
- Documentación de API
- Guías de usuario

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## Contacto

Para soporte técnico o consultas sobre el proyecto, contactar a través de los canales oficiales del repositorio.
