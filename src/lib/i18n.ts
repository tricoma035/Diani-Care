// Sistema de internacionalización nativo para Next.js 15
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Tipos
export type Language = 'es' | 'en' | 'sw';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
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
    },
    notes: {
      title: 'Notas Médicas',
      addNote: 'Añadir Nota',
      editNote: 'Editar Nota',
      deleteNote: 'Eliminar Nota',
      diagnosis: 'Diagnóstico',
      treatment: 'Tratamiento',
      observations: 'Observaciones',
      createdAt: 'Fecha de Creación',
      createdBy: 'Creado por',
      noNotes: 'No hay notas médicas',
      noteCreated: 'Nota creada exitosamente',
      noteUpdated: 'Nota actualizada exitosamente',
      noteDeleted: 'Nota eliminada exitosamente',
    },
    files: {
      title: 'Archivos',
      uploadFile: 'Subir Archivo',
      downloadFile: 'Descargar Archivo',
      deleteFile: 'Eliminar Archivo',
      fileName: 'Nombre del Archivo',
      fileSize: 'Tamaño del Archivo',
      uploadDate: 'Fecha de Subida',
      uploadedBy: 'Subido por',
      noFiles: 'No hay archivos',
      selectFile: 'Seleccionar archivo',
      uploading: 'Subiendo...',
      uploadSuccess: 'Archivo subido exitosamente',
      uploadError: 'Error al subir archivo',
      fileTypes: 'Tipos de archivo permitidos: PDF, JPG, PNG, DOC, DOCX',
      maxSize: 'Tamaño máximo: 10MB',
    },
    dashboard: {
      title: 'Panel de Control',
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
    },
    notes: {
      title: 'Medical Notes',
      addNote: 'Add Note',
      editNote: 'Edit Note',
      deleteNote: 'Delete Note',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      observations: 'Observations',
      createdAt: 'Created At',
      createdBy: 'Created By',
      noNotes: 'No medical notes',
      noteCreated: 'Note created successfully',
      noteUpdated: 'Note updated successfully',
      noteDeleted: 'Note deleted successfully',
    },
    files: {
      title: 'Files',
      uploadFile: 'Upload File',
      downloadFile: 'Download File',
      deleteFile: 'Delete File',
      fileName: 'File Name',
      fileSize: 'File Size',
      uploadDate: 'Upload Date',
      uploadedBy: 'Uploaded By',
      noFiles: 'No files',
      selectFile: 'Select file',
      uploading: 'Uploading...',
      uploadSuccess: 'File uploaded successfully',
      uploadError: 'Error uploading file',
      fileTypes: 'Allowed file types: PDF, JPG, PNG, DOC, DOCX',
      maxSize: 'Maximum size: 10MB',
    },
    dashboard: {
      title: 'Dashboard',
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
    },
    notes: {
      title: 'Maelezo ya Matibabu',
      addNote: 'Ongeza Maelezo',
      editNote: 'Hariri Maelezo',
      deleteNote: 'Futa Maelezo',
      diagnosis: 'Uchunguzi',
      treatment: 'Matibabu',
      observations: 'Uchunguzi',
      createdAt: 'Iliundwa',
      createdBy: 'Iliundwa na',
      noNotes: 'Hakuna maelezo ya matibabu',
      noteCreated: 'Maelezo yaliundwa kwa mafanikio',
      noteUpdated: 'Maelezo yalisasishwa kwa mafanikio',
      noteDeleted: 'Maelezo yalifutwa kwa mafanikio',
    },
    files: {
      title: 'Faili',
      uploadFile: 'Pakia Faili',
      downloadFile: 'Pakua Faili',
      deleteFile: 'Futa Faili',
      fileName: 'Jina la Faili',
      fileSize: 'Ukubwa wa Faili',
      uploadDate: 'Tarehe ya Kupakia',
      uploadedBy: 'Iliwekwa na',
      noFiles: 'Hakuna faili',
      selectFile: 'Chagua faili',
      uploading: 'Inapakia...',
      uploadSuccess: 'Faili ilipakwa kwa mafanikio',
      uploadError: 'Hitilafu katika kupakia faili',
      fileTypes: 'Aina za faili zinazoruhusiwa: PDF, JPG, PNG, DOC, DOCX',
      maxSize: 'Ukubwa wa juu: 10MB',
    },
    dashboard: {
      title: 'Dashibodi',
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
  params?: Record<string, any>
): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback a inglés si no se encuentra la traducción
      value = getTranslation(key, 'en', params);
      break;
    }
  }

  if (typeof value !== 'string') {
    return key; // Devolver la clave si no se encuentra la traducción
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

  const t = (key: string, params?: Record<string, any>) => {
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
