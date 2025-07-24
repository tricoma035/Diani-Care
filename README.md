# Hospital Kenia - Sistema de Gestión Médica

Sistema web completo para la gestión de pacientes y recursos médicos en hospitales de Kenia.

## 🚀 Características

- **Gestión de Pacientes**: Registro, búsqueda y seguimiento completo
- **Chatbot IA**: Asistente inteligente con acceso a base de datos e internet
- **Subida de Archivos**: Soporte para PDF, DOCX, TXT e imágenes con OCR
- **Autenticación Segura**: Sistema de login con roles (Director, Médico, Asistente)
- **Interfaz Responsiva**: Diseño moderno y accesible para dispositivos móviles

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **IA**: OpenAI GPT-4, Tesseract.js (OCR)
- **Estilos**: Tailwind CSS 4
- **Formularios**: React Hook Form + Zod

## 📋 Configuración del Proyecto

### Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd "App Hospital Kenia"

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir errores de ESLint automáticamente
- `npm run type-check` - Verificar tipos de TypeScript

## 🔧 Configuración Optimizada

### Archivos de Configuración

- **ESLint**: `eslint.config.mjs` (configuración unificada)
- **TypeScript**: `tsconfig.json` (optimizado para Next.js 15)
- **Tailwind**: `tailwind.config.ts` (colores médicos personalizados)
- **Next.js**: `next.config.ts` (optimizaciones de rendimiento)
- **Prettier**: `.prettierrc` (formato de código consistente)

### Optimizaciones Implementadas

- ✅ **ESLint unificado**: Una sola configuración en formato moderno
- ✅ **TypeScript optimizado**: Target ES2020, paths configurados
- ✅ **Tailwind optimizado**: Colores médicos, animaciones personalizadas
- ✅ **Next.js optimizado**: Importaciones optimizadas, imágenes WebP/AVIF
- ✅ **CI/CD mejorado**: Type check y lint en GitHub Actions
- ✅ **VSCode configurado**: Formato automático, organizador de imports

## 🌐 Despliegue

El proyecto está configurado para desplegarse automáticamente en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Los cambios en `main` se despliegan automáticamente

## 📁 Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
│   ├── api/            # API Routes
│   ├── auth/           # Páginas de autenticación
│   └── globals.css     # Estilos globales
├── components/         # Componentes React reutilizables
├── contexts/          # Contextos de React
└── lib/               # Utilidades y configuraciones
```

## 🔐 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
OPENAI_API_KEY=tu_clave_de_openai
SERPER_API_KEY=tu_clave_de_serper
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo o abre un issue en GitHub.
