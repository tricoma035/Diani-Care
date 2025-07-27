# Prompt para Recrear Sistema de Gestión Hospitalaria - Kenia (Parte 2)

## Implementación de Componentes

### 1. Contexto de Autenticación (`AuthContext.tsx`)

#### Estructura del Contexto

```typescript
interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    identityNumber: string,
    hospital: HospitalEnum,
    jobPosition: JobPosition
  ) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: unknown }>;
}
```

#### Funcionalidades Principales

1. **Inicialización de Sesión**:

   - Verificación de sesión existente al cargar la aplicación
   - Obtención de datos del usuario desde Supabase Auth
   - Carga de datos adicionales desde tabla `users`

2. **Registro de Usuario**:

   - Creación de usuario en Supabase Auth
   - Inserción en tabla `users` con datos adicionales
   - Validación de datos únicos (email, identity_number)

3. **Inicio de Sesión**:

   - Autenticación contra Supabase Auth
   - Carga de datos del usuario desde tabla `users`
   - Manejo de errores de autenticación

4. **Cierre de Sesión**:
   - Limpieza de sesión en Supabase Auth
   - Limpieza de estado local
   - Redirección a página de login

### 2. Sistema de Internacionalización (`i18n.tsx`)

#### Estructura de Traducciones

```typescript
interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    confirm: string;
    retry: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    fullName: string;
    identityNumber: string;
    hospital: string;
    jobPosition: string;
    signIn: string;
    signUp: string;
    signOut: string;
    forgotPassword: string;
    changePassword: string;
    mustChangePassword: string;
  };
  dashboard: {
    title: string;
    searchPlaceholder: string;
    addPatient: string;
    chatbot: string;
    signOut: string;
    name: string;
    date: string;
    patientRecord: string;
  };
  patients: {
    name: string;
    age: string;
    sex: string;
    identityNumber: string;
    hospital: string;
    male: string;
    female: string;
    other: string;
    years: string;
    addPatient: string;
    editPatient: string;
    deletePatient: string;
    viewPatient: string;
    patientInfo: string;
    noPatients: string;
    loading: string;
  };
  notes: {
    title: string;
    addNote: string;
    editNote: string;
    deleteNote: string;
    diagnosis: string;
    treatment: string;
    observations: string;
    noNotes: string;
    addFirstNote: string;
    loading: string;
  };
  files: {
    title: string;
    uploadFile: string;
    download: string;
    deleteFile: string;
    uploadedBy: string;
    fileSize: string;
    fileTypes: string;
    fileTypesImages: string;
    fileTypesDocs: string;
    fileTypesText: string;
    maxSize: string;
    noFiles: string;
    addFirstFile: string;
    dragAndDrop: string;
    orClickToSelect: string;
    selectFile: string;
    selectedFile: string;
    selectAnotherFile: string;
    uploading: string;
    uploadFileSubtitle: string;
  };
  chatbot: {
    welcome: string;
    database: string;
    internet: string;
    send: string;
    inputPlaceholder: string;
    conversations: string;
    newConversationTitle: string;
  };
}
```

#### Hook de Internacionalización

```typescript
export const useI18n = () => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string, params?: Record<string, unknown>) => {
    return getTranslation(key, language, params);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return { language, setLanguage: handleSetLanguage, t };
};
```

### 3. Configuración de Supabase (`supabase.ts`)

#### Interfaces de Tipos

```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  identity_number: string;
  hospital: HospitalEnum;
  job_position: JobPosition;
  must_change_password: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  created_by: string;
  full_name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  identity_number: string;
  hospital: HospitalEnum;
  created_at: string;
}

export interface PatientNote {
  id: string;
  patient_id: string;
  created_by: string;
  created_at: string;
  diagnosis: string | null;
  treatment: string | null;
  observations: string | null;
  users?: {
    full_name: string;
    job_position: string;
  };
}

export interface PatientFile {
  id: string;
  patient_id: string;
  note_id: string | null;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
  users?: {
    full_name: string;
  };
}
```

#### Configuración del Cliente

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

## Implementación de API Routes

### 1. API del Chatbot (`/api/chatbot-openai/route.ts`)

#### Funcionalidades Principales

1. **Modo Base de Datos**:

   - Extracción de referencia de paciente de la pregunta
   - Búsqueda de paciente por nombre o ID
   - Recopilación de información completa del paciente
   - Envío de contexto a OpenAI con instrucciones específicas

2. **Modo Internet**:

   - Búsquedas múltiples con Serper API
   - Eliminación de duplicados
   - Envío de información actualizada a OpenAI

3. **Procesamiento de Respuestas**:
   - Manejo de errores de OpenAI
   - Formateo de respuestas según idioma
   - Validación de respuestas

#### Estructura de la API

```typescript
export async function POST(req: NextRequest) {
  const { messages, language, systemPrompt, queryType } = await req.json();

  if (queryType === 'db') {
    // Lógica para consultas de base de datos
    const patientRef = extractPatientReference(lastUserMsg);
    const patient = await findPatient(patientRef);
    const context = await buildPatientContext(patient);

    const response = await callOpenAI(context, messages, systemPrompt);
    return NextResponse.json({ content: response });
  } else {
    // Lógica para consultas de internet
    const webResults = await searchInternet(lastUserMsg, language);
    const response = await callOpenAI(webResults, messages, systemPrompt);
    return NextResponse.json({ content: response });
  }
}
```

### 2. API de Procesamiento de Archivos (`/api/process-file/route.ts`)

#### Funcionalidades Principales

1. **Extracción de Texto**:

   - **TXT**: Lectura directa del archivo
   - **PDF**: Uso de pdf-parse para extraer texto
   - **DOCX**: Uso de mammoth para extraer texto
   - **Imágenes**: Uso de Tesseract.js para OCR

2. **Almacenamiento de Contenido**:

   - División en chunks de 1000 caracteres
   - Almacenamiento en tabla `file_contents`
   - Relación con paciente y archivo original

3. **Manejo de Errores**:
   - Validación de tipos de archivo
   - Manejo de errores de procesamiento
   - Respuestas informativas sobre el estado

#### Estructura de la API

```typescript
export async function POST(req: NextRequest) {
  const { fileUrl, fileName, patientId } = await req.json();

  const { content, fileType } = await extractTextFromFile(
    fileUrl,
    fileName,
    patientId
  );

  if (content.includes('procesado correctamente')) {
    // El contenido ya se guardó en chunks
    return NextResponse.json({
      success: true,
      message: 'Archivo procesado correctamente',
    });
  } else {
    // Guardar registro para archivos no procesables
    await supabase.from('file_contents').insert({
      file_path: fileUrl,
      file_name: fileName,
      file_type: fileType,
      content,
      patient_id: patientId,
    });

    return NextResponse.json({
      success: true,
      message: 'Archivo guardado correctamente',
    });
  }
}
```

## Implementación de Componentes Principales

### 1. Dashboard (`Dashboard.tsx`)

#### Funcionalidades Principales

1. **Gestión de Estado**:

   - Lista de pacientes con filtros y ordenamiento
   - Estados de carga y error
   - Modales para crear/editar pacientes

2. **Búsqueda y Filtrado**:

   - Búsqueda en tiempo real por nombre o ID
   - Ordenamiento por nombre o fecha
   - Actualización automática de resultados

3. **Acciones de Pacientes**:
   - Crear nuevo paciente
   - Editar paciente existente
   - Eliminar paciente con confirmación
   - Ver detalles del paciente

#### Estructura del Componente

```typescript
export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('full_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Funciones de gestión de pacientes
  const handlePatientSubmit = async (patientData: Partial<Patient>) => {
    /* ... */
  };
  const handleDeletePatient = async (patientId: string) => {
    /* ... */
  };
  const handleEditPatient = (patient: Patient) => {
    /* ... */
  };
  const handleViewPatient = (patient: Patient) => {
    /* ... */
  };
  const handleSort = (field: SortOption) => {
    /* ... */
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header con información del usuario */}
      {/* Barra de herramientas con búsqueda y filtros */}
      {/* Lista de pacientes */}
      {/* Modales para gestión de pacientes */}
    </div>
  );
}
```

### 2. Chatbot (`Chatbot.tsx`)

#### Funcionalidades Principales

1. **Gestión de Conversaciones**:

   - Lista de conversaciones anteriores
   - Crear nueva conversación
   - Editar título de conversación
   - Eliminar conversación

2. **Modos de Consulta**:

   - Selector entre modo "Base de Datos" e "Internet"
   - Interfaz adaptativa según el modo
   - Indicadores visuales del modo activo

3. **Interfaz de Chat**:
   - Área de mensajes con scroll
   - Campo de entrada con validación
   - Indicadores de carga
   - Formateo de mensajes según rol

#### Estructura del Componente

```typescript
export default function Chatbot({ onClose }: ChatbotProps) {
  const [queryType, setQueryType] = useState<'db' | 'internet'>('db');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Funciones de gestión de conversaciones
  const handleNewConversation = async () => {
    /* ... */
  };
  const handleSelectConversation = (conv: ChatConversation) => {
    /* ... */
  };
  const handleDeleteConversation = async (convId: string) => {
    /* ... */
  };
  const handleSend = async (e: React.FormEvent) => {
    /* ... */
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-end'>
      <div className='flex w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl'>
        {/* Panel lateral con conversaciones */}
        {/* Área principal del chat */}
        {/* Selector de modo de consulta */}
        {/* Área de mensajes */}
        {/* Campo de entrada */}
      </div>
    </div>
  );
}
```

### 3. Vista Detallada de Paciente (`PatientDetail.tsx`)

#### Funcionalidades Principales

1. **Información del Paciente**:

   - Datos personales completos
   - Información de registro
   - Indicadores visuales de sexo y edad

2. **Gestión de Notas**:

   - Lista cronológica de notas médicas
   - Crear, editar y eliminar notas
   - Información del médico que creó cada nota

3. **Gestión de Archivos**:
   - Grid de archivos con información
   - Subida de nuevos archivos
   - Descarga y eliminación de archivos

#### Estructura del Componente

```typescript
export default function PatientDetail({
  patient,
  onCloseAction,
}: PatientDetailProps) {
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<PatientNote | null>(null);

  // Funciones de gestión de notas y archivos
  const handleNoteSubmit = async (noteData: Partial<PatientNote>) => {
    /* ... */
  };
  const handleDeleteNote = async (noteId: string) => {
    /* ... */
  };
  const handleDownloadFile = async (file: PatientFile) => {
    /* ... */
  };
  const handleDeleteFile = async (file: PatientFile) => {
    /* ... */
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header con información del paciente */}
        {/* Información básica del paciente */}
        {/* Pestañas de contenido (notas y archivos) */}
        {/* Sección de notas médicas */}
        {/* Sección de archivos */}
        {/* Modales para gestión */}
      </div>
    </div>
  );
}
```

## Configuración de Base de Datos

### Enums y Tipos Personalizados

#### Enum de Hospitales

```sql
CREATE TYPE hospital_enum AS ENUM (
  'Diani Beach Hospital (Ukunda)',
  'Palm Beach Hospital (Ukunda)',
  'Diani Health Center (Ukunda)',
  'Pendo Duruma Medical Centre (Kwale County)',
  'Ukunda Medical Clinic (Ukunda)',
  'Sunshine Medical Clinic (Kwale County)'
);
```

#### Enum de Posiciones de Trabajo

```sql
CREATE TYPE job_position_enum AS ENUM (
  'Director',
  'Médico',
  'Asistente'
);
```

### Triggers de Auditoría

#### Trigger para Pacientes

```sql
CREATE OR REPLACE FUNCTION log_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO modification_logs (patient_id, modified_by, action_type, changes)
    VALUES (NEW.id, current_setting('app.current_user_id')::uuid, 'edit',
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO modification_logs (patient_id, modified_by, action_type, changes)
    VALUES (OLD.id, current_setting('app.current_user_id')::uuid, 'delete',
            jsonb_build_object('deleted_record', to_jsonb(OLD)));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_modification_trigger
  AFTER UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_patient_changes();
```

### Políticas RLS

#### Política para Usuarios

```sql
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Política para Pacientes

```sql
CREATE POLICY "Users can view patients from their hospital" ON patients
  FOR SELECT USING (
    hospital = (
      SELECT hospital FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create patients in their hospital" ON patients
  FOR INSERT WITH CHECK (
    hospital = (
      SELECT hospital FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update patients from their hospital" ON patients
  FOR UPDATE USING (
    hospital = (
      SELECT hospital FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete patients from their hospital" ON patients
  FOR DELETE USING (
    hospital = (
      SELECT hospital FROM users WHERE id = auth.uid()
    )
  );
```

## Configuración de Storage

### Bucket de Archivos

```sql
-- Crear bucket para archivos de pacientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', true);

-- Política para subir archivos
CREATE POLICY "Users can upload files for their hospital patients" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id = auth.uid()
      )
    )
  );

-- Política para ver archivos
CREATE POLICY "Users can view files from their hospital" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id = auth.uid()
      )
    )
  );

-- Política para eliminar archivos
CREATE POLICY "Users can delete files from their hospital" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id = auth.uid()
      )
    )
  );
```

## Validaciones y Esquemas

### Esquemas de Validación con Zod

#### Esquema de Paciente

```typescript
const patientSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  age: z.number().min(0).max(150, 'La edad debe estar entre 0 y 150 años'),
  sex: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Selecciona un sexo válido' }),
  }),
  identity_number: z
    .string()
    .min(1, 'El número de identificación es requerido'),
});

type PatientForm = z.infer<typeof patientSchema>;
```

#### Esquema de Nota Médica

```typescript
const noteSchema = z.object({
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  treatment: z.string().min(1, 'El tratamiento es requerido'),
  observations: z.string().optional(),
});

type NoteForm = z.infer<typeof noteSchema>;
```

## Consideraciones de Seguridad

### Validaciones de Frontend

- Todos los formularios usan Zod para validación
- Sanitización de inputs antes de enviar
- Validación de tipos de archivo y tamaño
- Confirmación para acciones destructivas

### Validaciones de Backend

- Verificación de permisos en cada operación
- Validación de datos en API routes
- Sanitización de consultas SQL
- Manejo seguro de archivos

### Políticas de Seguridad

- RLS habilitado en todas las tablas
- Políticas específicas por rol y hospital
- Auditoría completa de cambios
- Tokens JWT seguros de Supabase

## Optimizaciones de Rendimiento

### Frontend

- Lazy loading de componentes pesados
- Memoización de componentes con React.memo
- Uso de useCallback para funciones
- Optimización de re-renders

### Backend

- Consultas optimizadas con índices
- Paginación para listas grandes
- Caché de consultas frecuentes
- Procesamiento asíncrono de archivos

### Base de Datos

- Índices en campos de búsqueda frecuente
- Consultas optimizadas con JOINs
- Particionamiento de tablas grandes (futuro)
- Backup automático y recuperación

## Instrucciones Finales

### Orden de Implementación

1. **Configuración Inicial**: Next.js, TypeScript, Tailwind CSS
2. **Base de Datos**: Crear tablas, enums, triggers y políticas RLS
3. **Autenticación**: Supabase Auth y contexto de React
4. **Internacionalización**: Sistema de traducciones
5. **Componentes Base**: Layout, modales, formularios
6. **Dashboard**: Lista de pacientes y funcionalidades básicas
7. **Gestión de Pacientes**: CRUD completo
8. **Notas Médicas**: Sistema de notas
9. **Gestión de Archivos**: Subida, procesamiento y descarga
10. **Chatbot**: Integración con OpenAI y Serper
11. **Auditoría**: Sistema de logs
12. **Testing y Optimización**: Pruebas y mejoras de rendimiento

### Consideraciones Importantes

- **Responsive Design**: La aplicación debe funcionar en móviles y tablets
- **Accesibilidad**: Cumplir con estándares WCAG
- **UX/UI**: Interfaz moderna y intuitiva
- **Performance**: Carga rápida y experiencia fluida
- **Seguridad**: Protección de datos sensibles
- **Escalabilidad**: Arquitectura preparada para crecimiento

### Documentación del Código

- Comentarios en español para todas las funciones
- Documentación de APIs y componentes
- Guías de usuario y administrador
- README completo con instrucciones de instalación

Este prompt proporciona toda la información necesaria para recrear completamente el sistema de gestión hospitalaria. Cada sección incluye detalles específicos sobre implementación, configuración y mejores prácticas.
