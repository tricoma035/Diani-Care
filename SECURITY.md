# Política de Seguridad

## Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad en este proyecto, por favor sigue estos pasos:

1. **NO** crees un issue público en GitHub
2. Envía un email a [tu-email@ejemplo.com] con el asunto "VULNERABILIDAD DE SEGURIDAD"
3. Incluye detalles específicos sobre la vulnerabilidad
4. Proporciona pasos para reproducir el problema

## Medidas de Seguridad Implementadas

### Autenticación
- Verificación por email obligatoria
- Contraseñas gestionadas por Supabase Auth
- Sesiones seguras con tokens JWT

### Base de Datos
- Row Level Security (RLS) habilitado
- Políticas de acceso granulares
- Logs de auditoría completos

### Frontend
- Validación de entrada en todos los formularios
- Sanitización de datos
- Protección contra XSS

### API
- Autenticación requerida para todas las operaciones
- Rate limiting configurado
- Headers de seguridad implementados

## Actualizaciones de Seguridad

- Mantenemos actualizadas todas las dependencias
- Revisamos regularmente las vulnerabilidades conocidas
- Implementamos parches de seguridad cuando sea necesario

## Responsabilidad

Este proyecto sigue las mejores prácticas de seguridad, pero no garantizamos la ausencia total de vulnerabilidades. Los usuarios son responsables de evaluar la seguridad para su caso de uso específico. 