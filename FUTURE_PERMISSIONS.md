# Permisos por Rol - Implementación Futura

Este documento describe cómo implementar permisos específicos por rol en el sistema hospitalario.

## 🎯 Objetivo

Implementar un sistema de permisos granular basado en el rol del usuario (Director, Médico, Asistente) y su hospital.

## 📋 Roles y Permisos Propuestos

### Director

- **Acceso completo** a todos los datos del hospital
- **Gestión de usuarios** del hospital
- **Configuración** del hospital
- **Reportes** y estadísticas
- **Auditoría** completa

### Médico

- **Acceso** solo a sus pacientes asignados
- **Crear/editar** notas médicas
- **Subir archivos** para sus pacientes
- **Ver historial** de sus pacientes
- **Sin acceso** a gestión de usuarios

### Asistente

- **Solo lectura** de datos
- **Crear notas básicas** (observaciones)
- **Subir archivos** (escaneos, documentos)
- **Sin acceso** a diagnósticos o tratamientos
- **Sin acceso** a gestión de pacientes

## 🏗️ Implementación Técnica

### 1. Modificar Políticas RLS

```sql
-- Ejemplo: Restringir acceso a pacientes por hospital
CREATE POLICY "Users can only access their hospital patients" ON patients
    FOR ALL USING (
        hospital = (
            SELECT hospital FROM users WHERE id = auth.uid()
        )
    );

-- Ejemplo: Solo médicos pueden crear diagnósticos
CREATE POLICY "Only doctors can create diagnoses" ON patient_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND job_position IN ('Director', 'Médico')
        )
    );
```

### 2. Componentes a Modificar

#### AuthContext

```typescript
// Añadir verificación de permisos
const hasPermission = (permission: string) => {
  if (!appUser) return false;

  switch (permission) {
    case 'manage_users':
      return appUser.job_position === 'Director';
    case 'create_diagnosis':
      return ['Director', 'Médico'].includes(appUser.job_position);
    case 'edit_patients':
      return ['Director', 'Médico'].includes(appUser.job_position);
    default:
      return false;
  }
};
```

#### Dashboard

```typescript
// Mostrar/ocultar botones según permisos
{
  hasPermission('manage_users') && <button>Gestionar Usuarios</button>;
}

{
  hasPermission('create_diagnosis') && <button>Añadir Diagnóstico</button>;
}
```

#### PatientDetail

```typescript
// Restringir acciones según rol
const canEditPatient = hasPermission('edit_patients');
const canCreateDiagnosis = hasPermission('create_diagnosis');
const canManageFiles = hasPermission('manage_files');
```

### 3. Filtros por Hospital

```typescript
// En loadPatients()
const loadPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('hospital', appUser?.hospital) // Solo pacientes del hospital
    .order(sortBy, { ascending: sortOrder === 'asc' });
};
```

## 🔒 Políticas de Seguridad

### Nivel de Base de Datos

- **RLS por hospital**: Usuarios solo ven datos de su hospital
- **RLS por rol**: Restricciones basadas en job_position
- **RLS por usuario**: Algunos datos solo para el usuario que los creó

### Nivel de Aplicación

- **Verificación de permisos** en cada acción
- **Ocultar elementos** de UI según permisos
- **Validación** en formularios

## 📊 Estructura de Permisos

```typescript
interface Permissions {
  // Gestión de usuarios
  manage_users: boolean;
  view_users: boolean;

  // Gestión de pacientes
  create_patients: boolean;
  edit_patients: boolean;
  delete_patients: boolean;
  view_all_patients: boolean;

  // Notas médicas
  create_diagnosis: boolean;
  create_treatment: boolean;
  create_observations: boolean;
  edit_notes: boolean;
  delete_notes: boolean;

  // Archivos
  upload_files: boolean;
  delete_files: boolean;
  download_files: boolean;

  // Auditoría
  view_logs: boolean;
  export_data: boolean;
}
```

## 🚀 Pasos de Implementación

1. **Fase 1**: Implementar filtros por hospital
2. **Fase 2**: Añadir restricciones por rol básicas
3. **Fase 3**: Implementar permisos granulares
4. **Fase 4**: Añadir interfaz de gestión de permisos
5. **Fase 5**: Auditoría y testing

## ⚠️ Consideraciones

- **Migración gradual**: No romper funcionalidad existente
- **Testing exhaustivo**: Verificar que los permisos funcionan correctamente
- **Documentación**: Actualizar README con nuevos permisos
- **Backup**: Hacer backup antes de cambios en políticas RLS

## 📝 Notas de Desarrollo

- Mantener compatibilidad con usuarios existentes
- Implementar permisos de forma incremental
- Probar cada cambio en entorno de desarrollo
- Documentar todos los cambios en políticas RLS
