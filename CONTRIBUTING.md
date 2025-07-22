# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema Hospitalario de Kenia!

## Cómo Contribuir

### 1. Fork del Repositorio
1. Haz fork del repositorio en GitHub
2. Clona tu fork localmente
3. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`

### 2. Configuración del Entorno
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en modo desarrollo
npm run dev
```

### 3. Desarrollo
- Sigue las convenciones de código existentes
- Escribe código limpio y bien documentado
- Añade tests cuando sea posible
- Mantén la funcionalidad existente

### 4. Commit y Push
```bash
# Añadir cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: añadir nueva funcionalidad de búsqueda"

# Push a tu fork
git push origin feature/nueva-funcionalidad
```

### 5. Pull Request
1. Ve a tu fork en GitHub
2. Crea un Pull Request
3. Describe claramente los cambios realizados
4. Incluye screenshots si es relevante

## Convenciones de Código

### TypeScript
- Usa tipos estrictos
- Evita `any` cuando sea posible
- Documenta interfaces complejas

### React
- Usa hooks de forma consistente
- Mantén componentes pequeños y enfocados
- Usa `useCallback` y `useMemo` cuando sea apropiado

### Estilo
- Sigue el formato de Prettier
- Usa ESLint para mantener calidad
- Comenta código complejo

## Estructura del Proyecto

```
src/
├── app/                 # Next.js App Router
├── components/          # Componentes React reutilizables
├── contexts/           # Context API para estado global
├── lib/               # Utilidades y configuración
└── types/             # Definiciones de tipos TypeScript
```

## Reportar Bugs

1. Usa el template de bug report
2. Incluye pasos para reproducir
3. Describe el comportamiento esperado vs actual
4. Incluye información del sistema

## Solicitar Features

1. Usa el template de feature request
2. Describe el problema que resuelve
3. Proporciona ejemplos de uso
4. Considera la implementación

## Contacto

Si tienes preguntas sobre cómo contribuir, puedes:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

¡Gracias por contribuir a mejorar la atención médica en Kenia! 