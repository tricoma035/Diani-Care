# 🏥 Sistema Hospitalario de Kenia

Sistema de gestión de pacientes para hospitales en Kenia, diseñado para profesionales médicos con baja alfabetización digital. Aplicación web moderna desarrollada con Next.js, Supabase y TypeScript.

## 🏥 Características

- **Autenticación segura** con Supabase Auth y verificación por email
- **Gestión de pacientes** completa (crear, editar, eliminar, ver)
- **Notas médicas** estructuradas con diagnóstico, tratamiento y observaciones
- **Archivos adjuntos** por paciente usando Supabase Storage
- **Logs de modificación** para auditoría completa
- **Interfaz simple** y fácil de usar para profesionales no técnicos
- **Multi-hospital** con agrupación por hospital
- **Roles de usuario**: Director, Médico, Asistente

## 🛠️ Tecnologías

- **Frontend**: Next.js 15 + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticación**: Supabase Auth con verificación por email
- **Base de datos**: PostgreSQL con Row Level Security (RLS)

## 📋 Estructura de Base de Datos

### Tabla `users`

- `id` (UUID, PK, FK a auth.users)
- `email` (TEXT, único)
- `full_name` (TEXT)
- `identity_number` (TEXT, único)
- `hospital` (TEXT, enum: 'Hospital A', 'Hospital B', 'Hospital C', 'Hospital D')
- `job_position` (TEXT, enum: 'Director', 'Médico', 'Asistente')
- `must_change_password` (BOOLEAN)
- `created_at` (TIMESTAMP)

### Tabla `patients`

- `id` (UUID, PK)
- `created_by` (UUID, FK a users)
- `full_name` (TEXT)
- `age` (INTEGER)
- `sex` (TEXT, enum: 'male', 'female', 'other')
- `identity_number` (TEXT)
- `hospital` (TEXT, enum: 'Hospital A', 'Hospital B', 'Hospital C', 'Hospital D')
- `created_at` (TIMESTAMP)

### Tabla `patient_notes`

- `id` (UUID, PK)
- `patient_id` (UUID, FK a patients)
- `created_by` (UUID, FK a users)
- `diagnosis` (TEXT)
- `treatment` (TEXT)
- `observations` (TEXT)
- `created_at` (TIMESTAMP)

### Tabla `patient_files`

- `id` (UUID, PK)
- `patient_id` (UUID, FK a patients)
- `note_id` (UUID, FK a patient_notes, opcional)
- `file_url` (TEXT)
- `uploaded_by` (UUID, FK a users)
- `uploaded_at` (TIMESTAMP)

### Tabla `modification_logs`

- `id` (UUID, PK)
- `patient_id` (UUID, FK a patients)
- `modified_by` (UUID, FK a users)
- `action_type` (TEXT, enum: 'edit', 'delete')
- `changes` (JSONB)
- `modified_at` (TIMESTAMP)

## 🔐 Autenticación

- **Registro**: Email + contraseña + datos personales + hospital + puesto
- **Verificación**: Email obligatorio antes de poder iniciar sesión
- **Login**: Email + contraseña
- **Seguridad**: Row Level Security (RLS) habilitado en todas las tablas

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd app-hospital-kenia
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**
   Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Ejecutar migraciones de base de datos**
   Las migraciones se aplican automáticamente al crear el proyecto.

5. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

**Nota**: El proyecto está configurado para funcionar sin Turbopack para evitar problemas con rutas que contienen espacios.

## 📱 Uso

1. **Registro**: Los usuarios se registran con email, contraseña y datos personales
2. **Verificación**: Deben verificar su email antes de poder iniciar sesión
3. **Login**: Inician sesión con email y contraseña
4. **Gestión de pacientes**: Pueden crear, editar, eliminar y ver pacientes
5. **Notas médicas**: Añadir notas estructuradas a cada paciente
6. **Archivos**: Subir archivos adjuntos (escáneres, PDFs, etc.)
7. **Auditoría**: Todos los cambios se registran automáticamente

## 🏗️ Arquitectura

- **Frontend**: Next.js App Router con componentes React
- **Estado**: Context API para autenticación
- **Base de datos**: Supabase PostgreSQL con RLS
- **Storage**: Supabase Storage para archivos
- **Auth**: Supabase Auth con verificación por email

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Verificación por email** obligatoria
- **Contraseñas** gestionadas por Supabase Auth
- **Políticas de acceso** basadas en autenticación
- **Logs de auditoría** para todas las modificaciones
- **Preparado para permisos por rol** (Director, Médico, Asistente)

## 📊 Funcionalidades por Rol

### Director

- Todas las funcionalidades de Médico y Asistente
- Acceso completo a todos los datos del hospital
- **Futuro**: Gestión de usuarios y configuración del hospital

### Médico

- Gestión completa de pacientes
- Crear y editar notas médicas
- Subir archivos adjuntos
- Ver historial de modificaciones
- **Futuro**: Acceso restringido solo a sus pacientes

### Asistente

- Ver pacientes
- Crear notas básicas
- Subir archivos
- Acceso limitado a ciertas funciones
- **Futuro**: Solo lectura de datos, sin modificación

## 🏥 Hospitales Disponibles

- **Diani Beach Hospital (Ukunda)**
- **Palm Beach Hospital (Ukunda)**
- **Diani Health Center (Ukunda)**
- **Pendo Duruma Medical Centre (Kwale County)**
- **Ukunda Medical Clinic (Ukunda)**
- **Sunshine Medical Clinic (Kwale County)**

## 🎨 Interfaz

- **Diseño minimalista** y fácil de usar
- **Responsive** para diferentes dispositivos
- **Iconografía clara** para facilitar la navegación
- **Formularios simples** con validación
- **Mensajes de error** claros y útiles

## 🔧 Desarrollo

### Estructura de archivos

```
src/
├── app/                 # Next.js App Router
├── components/          # Componentes React
├── contexts/           # Context API
└── lib/               # Utilidades y configuración
```

### Scripts disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting del código

## 📝 Notas de Desarrollo

- **TypeScript** para type safety
- **TailwindCSS** para estilos
- **Lucide React** para iconos
- **Supabase** para backend completo
- **Next.js 15** con App Router

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
