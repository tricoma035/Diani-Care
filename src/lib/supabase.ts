import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase para el navegador con configuración optimizada para producción
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'hospital-kenia-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'hospital-kenia-app',
      },
    },
    // Configuración optimizada para estabilidad en producción
    realtime: {
      params: {
        eventsPerSecond: 5, // Reducido para evitar sobrecarga
      },
    },
  }
);

// Tipos de datos para TypeScript
export interface User {
  id: string;
  email: string;
  full_name: string;
  identity_number: string;
  hospital:
    | 'Diani Beach Hospital (Ukunda)'
    | 'Palm Beach Hospital (Ukunda)'
    | 'Diani Health Center (Ukunda)'
    | 'Pendo Duruma Medical Centre (Kwale County)'
    | 'Ukunda Medical Clinic (Ukunda)'
    | 'Sunshine Medical Clinic (Kwale County)';
  job_position: 'Director' | 'Médico' | 'Asistente';
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
  hospital:
    | 'Diani Beach Hospital (Ukunda)'
    | 'Palm Beach Hospital (Ukunda)'
    | 'Diani Health Center (Ukunda)'
    | 'Pendo Duruma Medical Centre (Kwale County)'
    | 'Ukunda Medical Clinic (Ukunda)'
    | 'Sunshine Medical Clinic (Kwale County)';
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

export interface ModificationLog {
  id: string;
  patient_id: string;
  modified_by: string;
  action_type: 'edit' | 'delete';
  changes: Record<string, unknown>;
  modified_at: string;
}
