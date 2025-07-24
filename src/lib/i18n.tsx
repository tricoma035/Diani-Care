'use client';
// Sistema de internacionalización nativo para Next.js 15
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

// Tipos
export type Language = 'es' | 'en' | 'sw';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

// Traducciones
const translations = {
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Eliminar',
      close: 'Cerrar',
      back: 'Volver',
      search: 'Buscar',
      filter: 'Filtrar',
      all: 'Todos',
      yes: 'Sí',
      no: 'No',
      actions: 'Acciones',
      saveChanges: 'Guardar Cambios',
      saving: 'Guardando...',
      creating: 'Creando...',
    },
    auth: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      fullName: 'Nombre Completo',
      identityNumber: 'Número de Identificación',
      hospital: 'Hospital',
      jobPosition: 'Cargo',
      loginSuccess: 'Inicio de sesión exitoso',
      registerSuccess: 'Registro exitoso. Por favor, verifica tu email.',
      emailVerification: 'Verificación de Email',
      emailVerificationSuccess: '¡Cuenta verificada exitosamente!',
      emailVerificationError: 'Error al verificar la cuenta',
      invalidCredentials: 'Email o contraseña incorrectos',
      emailNotConfirmed: 'Por favor, verifica tu email antes de iniciar sesión',
      tooManyRequests: 'Demasiados intentos. Intenta de nuevo en unos minutos',
      userAlreadyExists: 'Este email ya está registrado',
      emailPlaceholder: 'usuario@hospital.com',
      fullNamePlaceholder: 'Nombre completo del paciente',
      identityNumberPlaceholder: 'Número de identidad o cédula',
      passwordPlaceholder: '••••••••',
      title: 'Sistema Hospitalario',
      subtitle: 'Gestión de pacientes y profesionales médicos',
      footer: 'Sistema de gestión hospitalaria para profesionales médicos',
    },
    hospitals: {
      dianiBeach: 'Diani Beach Hospital (Ukunda)',
      palmBeach: 'Palm Beach Hospital (Ukunda)',
      dianiHealth: 'Diani Health Center (Ukunda)',
      pendoDuruma: 'Pendo Duruma Medical Centre (Kwale County)',
      ukundaMedical: 'Ukunda Medical Clinic (Ukunda)',
      sunshineMedical: 'Sunshine Medical Clinic (Kwale County)',
    },
    jobPositions: {
      director: 'Director',
      doctor: 'Médico',
      assistant: 'Asistente',
    },
    patients: {
      title: 'Pacientes',
      addPatient: 'Añadir Paciente',
      addPatientSubtitle: 'Registra un nuevo paciente',
      editPatient: 'Editar Paciente',
      deletePatient: 'Eliminar Paciente',
      patientDetails: 'Detalles del Paciente',
      fullName: 'Nombre Completo',
      age: 'Edad',
      sex: 'Sexo',
      identityNumber: 'Número de Identificación',
      hospital: 'Hospital',
      createdAt: 'Fecha de Creación',
      createdBy: 'Creado por',
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      noPatients: 'No hay pacientes registrados',
      searchPatients: 'Buscar pacientes...',
      filterByHospital: 'Filtrar por hospital',
      patientCreated: 'Paciente creado exitosamente',
      patientUpdated: 'Paciente actualizado exitosamente',
      patientDeleted: 'Paciente eliminado exitosamente',
      confirmDelete: '¿Estás seguro de que quieres eliminar este paciente?',
      deleteWarning: 'Esta acción no se puede deshacer.',
      years: '{{count}} años',
      total: 'Total de pacientes: ',
      addFirstPatient: 'Comienza agregando el primer paciente al sistema',
      tableHeaders: {
        patient: 'Paciente',
        info: 'Información',
        createdAt: 'Fecha de Registro',
        actions: 'Acciones',
      },
      viewDetails: 'Ver detalles',
    },
    notes: {
      title: 'Notas Médicas',
      addNote: 'Añadir Nota',
      addNoteSubtitle: 'Registra una nueva nota médica',
      editNote: 'Editar Nota',
      editNoteSubtitle: 'Modifica la información de la nota',
      deleteNote: 'Eliminar Nota',
      diagnosis: 'Diagnóstico',
      diagnosisPlaceholder: 'Describe el diagnóstico del paciente...',
      treatment: 'Tratamiento',
      treatmentPlaceholder: 'Describe el tratamiento prescrito...',
      observations: 'Observaciones',
      observationsPlaceholder: 'Agrega observaciones adicionales...',
      createdAt: 'Fecha de Creación',
      createdBy: 'Creado por',
      noNotes: 'No hay notas médicas',
      noteCreated: 'Nota creada exitosamente',
      noteUpdated: 'Nota actualizada exitosamente',
      noteDeleted: 'Nota eliminada exitosamente',
      loading: 'Cargando notas...',
      addFirstNote: 'Agrega la primera nota médica para este paciente',
      infoTitle: 'Información de la Nota',
      infoDescription:
        'Esta nota será registrada con tu información profesional y fecha actual. Los campos de diagnóstico y tratamiento son obligatorios para mantener un registro médico completo.',
    },
    files: {
      title: 'Archivos Adjuntos',
      uploadFile: 'Subir Archivo',
      downloadFile: 'Descargar Archivo',
      deleteFile: 'Eliminar Archivo',
      fileName: 'Nombre del Archivo',
      fileSize: 'Tamaño: {{size}} MB',
      uploadDate: 'Fecha de Subida',
      uploadedBy: 'Subido por',
      noFiles: 'No hay archivos adjuntos',
      selectFile: 'Seleccionar archivo',
      uploading: 'Subiendo...',
      uploadSuccess: 'Archivo subido exitosamente',
      uploadError: 'Error al subir archivo',
      fileTypes: 'Tipos de archivo permitidos:',
      fileTypesImages: '• Imágenes: JPG, PNG, GIF',
      fileTypesDocs: '• Documentos: PDF, DOC, DOCX',
      fileTypesText: '• Texto: TXT',
      maxSize: '• Tamaño máximo: 10MB',
      addFirstFile: 'Sube documentos, imágenes o archivos relacionados',
      download: 'Descargar',
    },
    dashboard: {
      title: 'Panel de Control',
      subtitle: 'Gestión de pacientes y profesionales médicos',
      patientRecord: 'Ficha del Paciente',
      welcome: 'Bienvenido',
      totalPatients: 'Total de Pacientes',
      recentPatients: 'Pacientes Recientes',
      recentNotes: 'Notas Recientes',
      quickActions: 'Acciones Rápidas',
      addNewPatient: 'Añadir Nuevo Paciente',
      viewAllPatients: 'Ver Todos los Pacientes',
      searchPatients: 'Buscar Pacientes',
    },
    language: {
      title: 'Idioma',
      spanish: 'Español',
      english: 'Inglés',
      swahili: 'Swahili',
      changeLanguage: 'Cambiar Idioma',
    },
    navigation: {
      dashboard: 'Panel de Control',
      patients: 'Pacientes',
      profile: 'Perfil',
      settings: 'Configuración',
    },
    errors: {
      general: 'Ha ocurrido un error',
      network: 'Error de conexión',
      unauthorized: 'No autorizado',
      notFound: 'No encontrado',
      serverError: 'Error del servidor',
      validation: 'Error de validación',
    },
    validation: {
      required: 'Este campo es obligatorio',
      email: 'Por favor, introduce un email válido',
      minLength: 'Mínimo {{min}} caracteres',
      maxLength: 'Máximo {{max}} caracteres',
      passwordMatch: 'Las contraseñas no coinciden',
    },
    chatbot: {
      database: 'Base de datos',
      internet: 'Internet',
      welcome:
        '¡Hola! Elige el tipo de consulta y pregúntame lo que quieras sobre la base de datos o internet.',
      inputPlaceholder: 'Escribe tu pregunta...',
      send: 'Enviar',
      conversations: 'Conversaciones',
      newConversationTitle: 'Nueva conversación - {{date}}',
      dbNotImplemented:
        'La búsqueda en la base de datos estará disponible próximamente.',
      dbNeedPatientRef:
        'Por favor, indica el nombre o ID del paciente para buscar archivos o información.',
      dbNoPatient: 'No se encontró ningún paciente con esa referencia.',
      dbPatientFound: 'Paciente encontrado: {{name}}',
      dbNoFiles: 'No hay archivos asociados a este paciente.',
      dbFileContent: 'Contenido del archivo',
      dbFileTypeNotSupported:
        'La lectura automática solo está disponible para archivos TXT por ahora.',
      dbDiagnosis: 'Diagnóstico/Resumen generado',
      noBrowsing:
        'La búsqueda en internet no está disponible en este entorno. El modelo solo puede responder con información hasta 2023.',
      dbMultiplePatients:
        'Se han encontrado {{count}} pacientes. Por favor, especifica el nombre completo o el número de identificación:\n',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      back: 'Back',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      actions: 'Actions',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      creating: 'Creating...',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      identityNumber: 'Identity Number',
      hospital: 'Hospital',
      jobPosition: 'Job Position',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful. Please verify your email.',
      emailVerification: 'Email Verification',
      emailVerificationSuccess: 'Account verified successfully!',
      emailVerificationError: 'Error verifying account',
      invalidCredentials: 'Invalid email or password',
      emailNotConfirmed: 'Please verify your email before logging in',
      tooManyRequests: 'Too many attempts. Try again in a few minutes',
      userAlreadyExists: 'This email is already registered',
      emailPlaceholder: 'user@hospital.com',
      fullNamePlaceholder: 'Patient full name',
      identityNumberPlaceholder: 'Identity or document number',
      passwordPlaceholder: '••••••••',
      title: 'Hospital System',
      subtitle: 'Patient and medical professional management',
      footer: 'Hospital management system for medical professionals',
    },
    hospitals: {
      dianiBeach: 'Diani Beach Hospital (Ukunda)',
      palmBeach: 'Palm Beach Hospital (Ukunda)',
      dianiHealth: 'Diani Health Center (Ukunda)',
      pendoDuruma: 'Pendo Duruma Medical Centre (Kwale County)',
      ukundaMedical: 'Ukunda Medical Clinic (Ukunda)',
      sunshineMedical: 'Sunshine Medical Clinic (Kwale County)',
    },
    jobPositions: {
      director: 'Director',
      doctor: 'Doctor',
      assistant: 'Assistant',
    },
    patients: {
      title: 'Patients',
      addPatient: 'Add Patient',
      addPatientSubtitle: 'Register a new patient',
      editPatient: 'Edit Patient',
      deletePatient: 'Delete Patient',
      patientDetails: 'Patient Details',
      fullName: 'Full Name',
      age: 'Age',
      sex: 'Sex',
      identityNumber: 'Identity Number',
      hospital: 'Hospital',
      createdAt: 'Created At',
      createdBy: 'Created By',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      noPatients: 'No patients registered',
      searchPatients: 'Search patients...',
      filterByHospital: 'Filter by hospital',
      patientCreated: 'Patient created successfully',
      patientUpdated: 'Patient updated successfully',
      patientDeleted: 'Patient deleted successfully',
      confirmDelete: 'Are you sure you want to delete this patient?',
      deleteWarning: 'This action cannot be undone.',
      years: '{{count}} years',
      total: 'Total patients: ',
      addFirstPatient: 'Start by adding the first patient to the system',
      tableHeaders: {
        patient: 'Patient',
        info: 'Information',
        createdAt: 'Registration Date',
        actions: 'Actions',
      },
      viewDetails: 'View details',
    },
    notes: {
      title: 'Medical Notes',
      addNote: 'Add Note',
      addNoteSubtitle: 'Register a new medical note',
      editNote: 'Edit Note',
      editNoteSubtitle: 'Edit the note information',
      deleteNote: 'Delete Note',
      diagnosis: 'Diagnosis',
      diagnosisPlaceholder: 'Describe the patient diagnosis...',
      treatment: 'Treatment',
      treatmentPlaceholder: 'Describe the prescribed treatment...',
      observations: 'Observations',
      observationsPlaceholder: 'Add additional observations...',
      createdAt: 'Created At',
      createdBy: 'Created By',
      noNotes: 'No medical notes',
      noteCreated: 'Note created successfully',
      noteUpdated: 'Note updated successfully',
      noteDeleted: 'Note deleted successfully',
      loading: 'Loading notes...',
      addFirstNote: 'Add the first medical note for this patient',
      infoTitle: 'Note Information',
      infoDescription:
        'This note will be registered with your professional information and the current date. Diagnosis and treatment fields are required to keep a complete medical record.',
    },
    files: {
      title: 'Attached Files',
      uploadFile: 'Upload File',
      downloadFile: 'Download File',
      deleteFile: 'Delete File',
      fileName: 'File Name',
      fileSize: 'Size: {{size}} MB',
      uploadDate: 'Upload Date',
      uploadedBy: 'Uploaded By',
      noFiles: 'No attached files',
      selectFile: 'Select file',
      uploading: 'Uploading...',
      uploadSuccess: 'File uploaded successfully',
      uploadError: 'Error uploading file',
      fileTypes: 'Allowed file types:',
      fileTypesImages: '• Images: JPG, PNG, GIF',
      fileTypesDocs: '• Documents: PDF, DOC, DOCX',
      fileTypesText: '• Text: TXT',
      maxSize: '• Maximum size: 10MB',
      addFirstFile: 'Upload documents, images or related files',
      download: 'Download',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Patient and medical professional management',
      patientRecord: 'Patient Record',
      welcome: 'Welcome',
      totalPatients: 'Total Patients',
      recentPatients: 'Recent Patients',
      recentNotes: 'Recent Notes',
      quickActions: 'Quick Actions',
      addNewPatient: 'Add New Patient',
      viewAllPatients: 'View All Patients',
      searchPatients: 'Search Patients',
    },
    language: {
      title: 'Language',
      spanish: 'Spanish',
      english: 'English',
      swahili: 'Swahili',
      changeLanguage: 'Change Language',
    },
    navigation: {
      dashboard: 'Dashboard',
      patients: 'Patients',
      profile: 'Profile',
      settings: 'Settings',
    },
    errors: {
      general: 'An error occurred',
      network: 'Network error',
      unauthorized: 'Unauthorized',
      notFound: 'Not found',
      serverError: 'Server error',
      validation: 'Validation error',
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email',
      minLength: 'Minimum {{min}} characters',
      maxLength: 'Maximum {{max}} characters',
      passwordMatch: 'Passwords do not match',
    },
    chatbot: {
      database: 'Database',
      internet: 'Internet',
      welcome:
        'Hi! Choose the query type and ask me anything about the database or the internet.',
      inputPlaceholder: 'Type your question...',
      send: 'Send',
      conversations: 'Conversations',
      newConversationTitle: 'New conversation - {{date}}',
      dbNotImplemented: 'Database search will be available soon.',
      dbNeedPatientRef:
        'Please specify the patient name or ID to search for files or information.',
      dbNoPatient: 'No patient found with that reference.',
      dbPatientFound: 'Patient found: {{name}}',
      dbNoFiles: 'No files associated with this patient.',
      dbFileContent: 'File content',
      dbFileTypeNotSupported:
        'Automatic reading is only available for TXT files for now.',
      dbDiagnosis: 'Diagnosis/Summary generated',
      noBrowsing:
        'La búsqueda en internet no está disponible en este entorno. El modelo solo puede responder con información hasta 2023.',
      dbMultiplePatients:
        '{{count}} patients found. Please specify the full name or identity number:\n',
    },
  },
  sw: {
    common: {
      loading: 'Inapakia...',
      error: 'Hitilafu',
      success: 'Mafanikio',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      edit: 'Hariri',
      delete: 'Futa',
      close: 'Funga',
      back: 'Rudi',
      search: 'Tafuta',
      filter: 'Chuja',
      all: 'Yote',
      yes: 'Ndiyo',
      no: 'Hapana',
      actions: 'Vitendo',
      saveChanges: 'Hifadhi Mabadiliko',
      saving: 'Inahifadhi...',
      creating: 'Inaunda...',
    },
    auth: {
      login: 'Ingia',
      register: 'Jisajili',
      logout: 'Ondoka',
      email: 'Barua Pepe',
      password: 'Nywila',
      confirmPassword: 'Thibitisha Nywila',
      fullName: 'Jina Kamili',
      identityNumber: 'Nambari ya Kitambulisho',
      hospital: 'Hospitali',
      jobPosition: 'Kazi',
      loginSuccess: 'Kuingia kufanikiwa',
      registerSuccess:
        'Usajili ulifanikiwa. Tafadhali thibitisha barua pepe yako.',
      emailVerification: 'Uthibitishaji wa Barua Pepe',
      emailVerificationSuccess: 'Akaunti imethibitishwa kwa mafanikio!',
      emailVerificationError: 'Hitilafu katika kuthibitisha akaunti',
      invalidCredentials: 'Barua pepe au nywila si sahihi',
      emailNotConfirmed:
        'Tafadhali thibitisha barua pepe yako kabla ya kuingia',
      tooManyRequests:
        'Majaribio mengi sana. Jaribu tena baada ya dakika chache',
      userAlreadyExists: 'Barua pepe hii tayari imesajiliwa',
      emailPlaceholder: 'mtumiaji@hospitali.com',
      fullNamePlaceholder: 'Jina Kamili',
      identityNumberPlaceholder: 'Nambari ya kitambulisho au hati',
      passwordPlaceholder: '••••••••',
      title: 'Mfumo wa Hospitali',
      subtitle: 'Usimamizi wa wagonjwa na wataalamu wa afya',
      footer: 'Mfumo wa usimamizi wa hospitali kwa wataalamu wa afya',
    },
    hospitals: {
      dianiBeach: 'Hospitali ya Diani Beach (Ukunda)',
      palmBeach: 'Hospitali ya Palm Beach (Ukunda)',
      dianiHealth: 'Kituo cha Afya cha Diani (Ukunda)',
      pendoDuruma: 'Kituo cha Matibabu cha Pendo Duruma (Kaunti ya Kwale)',
      ukundaMedical: 'Kliniki ya Matibabu ya Ukunda (Ukunda)',
      sunshineMedical: 'Kliniki ya Matibabu ya Sunshine (Kaunti ya Kwale)',
    },
    jobPositions: {
      director: 'Mkurugenzi',
      doctor: 'Daktari',
      assistant: 'Msaidizi',
    },
    patients: {
      title: 'Wagonjwa',
      addPatient: 'Ongeza Mgonjwa',
      addPatientSubtitle: 'Sajili mgonjwa mpya',
      editPatient: 'Hariri Mgonjwa',
      deletePatient: 'Futa Mgonjwa',
      patientDetails: 'Maelezo ya Mgonjwa',
      fullName: 'Jina Kamili',
      age: 'Umri',
      sex: 'Jinsia',
      identityNumber: 'Nambari ya Kitambulisho',
      hospital: 'Hospitali',
      createdAt: 'Iliundwa',
      createdBy: 'Iliundwa na',
      male: 'Mwanaume',
      female: 'Mwanamke',
      other: 'Nyingine',
      noPatients: 'Hakuna wagonjwa waliosajiliwa',
      searchPatients: 'Tafuta wagonjwa...',
      filterByHospital: 'Chuja kwa hospitali',
      patientCreated: 'Mgongwa aliundwa kwa mafanikio',
      patientUpdated: 'Mgongwa alisasishwa kwa mafanikio',
      patientDeleted: 'Mgongwa alifutwa kwa mafanikio',
      confirmDelete: 'Una uhakika unataka kufuta mgonjwa huyu?',
      deleteWarning: 'Kitendo hiki hakiwezi kurekebishwa.',
      years: '{{count}} miaka',
      total: 'Jumla ya wagonjwa: ',
      addFirstPatient: 'Anza kwa kuongeza mgonjwa wa kwanza kwenye mfumo',
      tableHeaders: {
        patient: 'Mgonjwa',
        info: 'Taarifa',
        createdAt: 'Tarehe ya Usajili',
        actions: 'Vitendo',
      },
      viewDetails: 'Tazama maelezo',
    },
    notes: {
      title: 'Maelezo ya Matibabu',
      addNote: 'Ongeza Maelezo',
      addNoteSubtitle: 'Sajili maelezo mapya ya matibabu',
      editNote: 'Hariri Maelezo',
      editNoteSubtitle: 'Hariri taarifa za maelezo',
      deleteNote: 'Futa Maelezo',
      diagnosis: 'Uchunguzi',
      diagnosisPlaceholder: 'Eleza uchunguzi wa mgonjwa...',
      treatment: 'Matibabu',
      treatmentPlaceholder: 'Eleza matibabu yaliyopendekezwa...',
      observations: 'Uchunguzi',
      observationsPlaceholder: 'Ongeza uchunguzi wa ziada...',
      createdAt: 'Iliundwa',
      createdBy: 'Iliundwa na',
      noNotes: 'Hakuna maelezo ya matibabu',
      noteCreated: 'Maelezo yaliundwa kwa mafanikio',
      noteUpdated: 'Maelezo yalisasishwa kwa mafanikio',
      noteDeleted: 'Maelezo yalifutwa kwa mafanikio',
      loading: 'Inapakia maelezo...',
      addFirstNote: 'Ongeza maelezo ya kwanza ya matibabu kwa mgonjwa huyu',
      infoTitle: 'Taarifa za Maelezo',
      infoDescription:
        'Maelezo haya yatasajiliwa na taarifa zako za kitaaluma na tarehe ya sasa. Sehemu za uchunguzi na matibabu ni lazima ili kuweka rekodi kamili ya matibabu.',
    },
    files: {
      title: 'Faili Zilizounganishwa',
      uploadFile: 'Pakia Faili',
      downloadFile: 'Pakua Faili',
      deleteFile: 'Futa Faili',
      fileName: 'Jina la Faili',
      fileSize: 'Ukubwa: {{size}} MB',
      uploadDate: 'Tarehe ya Kupakia',
      uploadedBy: 'Iliwekwa na',
      noFiles: 'Hakuna faili zilizounganishwa',
      selectFile: 'Chagua faili',
      uploading: 'Inapakia...',
      uploadSuccess: 'Faili ilipakwa kwa mafanikio',
      uploadError: 'Hitilafu katika kupakia faili',
      fileTypes: 'Aina za faili zinazoruhusiwa:',
      fileTypesImages: '• Picha: JPG, PNG, GIF',
      fileTypesDocs: '• Nyaraka: PDF, DOC, DOCX',
      fileTypesText: '• Maandishi: TXT',
      maxSize: '• Ukubwa wa juu: 10MB',
      addFirstFile: 'Pakia nyaraka, picha au faili zinazohusiana',
      download: 'Pakua',
    },
    dashboard: {
      title: 'Dashibodi',
      subtitle: 'Usimamizi wa wagonjwa na wataalamu wa afya',
      patientRecord: 'Fomu ya Mgonjwa',
      welcome: 'Karibu',
      totalPatients: 'Jumla ya Wagonjwa',
      recentPatients: 'Wagonjwa wa Hivi Karibuni',
      recentNotes: 'Maelezo ya Hivi Karibuni',
      quickActions: 'Vitendo vya Haraka',
      addNewPatient: 'Ongeza Mgonjwa Mpya',
      viewAllPatients: 'Ona Wagonjwa Wote',
      searchPatients: 'Tafuta Wagonjwa',
    },
    language: {
      title: 'Lugha',
      spanish: 'Kihispania',
      english: 'Kiingereza',
      swahili: 'Kiswahili',
      changeLanguage: 'Badilisha Lugha',
    },
    navigation: {
      dashboard: 'Dashibodi',
      patients: 'Wagonjwa',
      profile: 'Wasifu',
      settings: 'Mipangilio',
    },
    errors: {
      general: 'Hitilafu imetokea',
      network: 'Hitilafu ya mtandao',
      unauthorized: 'Hauna ruhusa',
      notFound: 'Haijapatikana',
      serverError: 'Hitilafu ya seva',
      validation: 'Hitilafu ya uthibitishaji',
    },
    validation: {
      required: 'Sehemu hii inahitajika',
      email: 'Tafadhali weka barua pepe sahihi',
      minLength: 'Herufi {{min}} za chini',
      maxLength: 'Herufi {{max}} za juu',
      passwordMatch: 'Nywila hazifanani',
    },
    chatbot: {
      database: 'Hifadhidata',
      internet: 'Intaneti',
      welcome:
        'Habari! Chagua aina ya utafutaji na niulize chochote kuhusu hifadhidata au intaneti.',
      inputPlaceholder: 'Andika swali lako...',
      send: 'Tuma',
      conversations: 'Mazungumzo',
      newConversationTitle: 'Mazungumzo mapya - {{date}}',
      dbNotImplemented:
        'Utafutaji kwenye hifadhidata utapatikana hivi karibuni.',
      dbNeedPatientRef:
        'Tafadhali taja jina au nambari ya mgonjwa ili kutafuta faili au taarifa.',
      dbNoPatient: 'Hakuna mgonjwa aliyepatikana kwa marejeleo hayo.',
      dbPatientFound: 'Mgonjwa amepatikana: {{name}}',
      dbNoFiles: 'Hakuna faili zilizounganishwa na mgonjwa huyu.',
      dbFileContent: 'Yaliyomo kwenye faili',
      dbFileTypeNotSupported:
        'Usomaji wa moja kwa moja unapatikana tu kwa faili za TXT kwa sasa.',
      dbDiagnosis: 'Uchunguzi/Muhtasari uliotolewa',
      noBrowsing:
        'La búsqueda en internet no está disponible en este entorno. El modelo solo puede responder con información hasta 2023.',
      dbMultiplePatients:
        'Wagonjwa {{count}} wamepatikana. Tafadhali taja jina kamili au nambari ya kitambulisho:\n',
    },
  },
};

// Contexto de internacionalización
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Hook personalizado para usar traducciones
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Función para obtener traducción con interpolación
const getTranslation = (
  key: string,
  language: Language,
  params?: Record<string, unknown>
): string => {
  const keys = key.split('.');
  let value: unknown = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Solo hacer fallback si no estamos ya en inglés
      if (language !== 'en') {
        return getTranslation(key, 'en', params);
      } else {
        return key; // Devolver la clave si no se encuentra en inglés
      }
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Interpolación de parámetros
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? String(params[param]) : match;
    });
  }

  return value;
};

// Proveedor de contexto
interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  // Cargar idioma guardado en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['es', 'en', 'sw'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      } else {
        // Detectar idioma del navegador
        const browserLanguage = navigator.language.split('-')[0];
        if (browserLanguage === 'es') {
          setLanguage('es');
        } else if (browserLanguage === 'sw') {
          setLanguage('sw');
        } else {
          setLanguage('en');
        }
      }
    }
  }, []);

  // Guardar idioma en localStorage cuando cambie
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string, params?: Record<string, unknown>) => {
    return getTranslation(key, language, params);
  };

  return (
    <I18nContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </I18nContext.Provider>
  );
};
