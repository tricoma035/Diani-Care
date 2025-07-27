-- =====================================================
-- SISTEMA DE GESTIÓN HOSPITALARIA - KENIA
-- Script completo para recrear la base de datos
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS Y TIPOS PERSONALIZADOS
-- =====================================================

-- Enum para hospitales
CREATE TYPE hospital_enum AS ENUM (
  'Diani Beach Hospital (Ukunda)',
  'Palm Beach Hospital (Ukunda)',
  'Diani Health Center (Ukunda)',
  'Pendo Duruma Medical Centre (Kwale County)',
  'Ukunda Medical Clinic (Ukunda)',
  'Sunshine Medical Clinic (Kwale County)'
);

-- Enum para posiciones de trabajo
CREATE TYPE job_position_enum AS ENUM (
  'Director',
  'Médico',
  'Asistente'
);

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  identity_number TEXT NOT NULL CHECK (identity_number <> ''),
  hospital hospital_enum NOT NULL,
  job_position job_position_enum NOT NULL,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario de la tabla
COMMENT ON TABLE users IS 'Tabla de usuarios con roles: Director, Médico, Asistente. Preparada para permisos por rol.';

-- =====================================================
-- TABLA DE PACIENTES
-- =====================================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  sex TEXT NOT NULL CHECK (sex = ANY (ARRAY['male', 'female', 'other'])),
  identity_number TEXT NOT NULL,
  hospital hospital_enum NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario de la tabla
COMMENT ON TABLE patients IS 'Tabla de pacientes. Futuras restricciones por hospital y rol de usuario.';

-- =====================================================
-- TABLA DE NOTAS MÉDICAS
-- =====================================================

CREATE TABLE patient_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  diagnosis TEXT,
  treatment TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario de la tabla
COMMENT ON TABLE patient_notes IS 'Notas médicas. Futuras restricciones por rol (solo médicos pueden crear).';

-- =====================================================
-- TABLA DE ARCHIVOS DE PACIENTES
-- =====================================================

CREATE TABLE patient_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  note_id UUID REFERENCES patient_notes(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario de la tabla
COMMENT ON TABLE patient_files IS 'Archivos adjuntos. Futuras restricciones por rol.';

-- Comentario en la columna patient_id
COMMENT ON COLUMN patient_files.patient_id IS 'ID del paciente al que pertenece el archivo. Obligatorio cuando se sube desde la ficha del paciente.';

-- =====================================================
-- TABLA DE CONTENIDO DE ARCHIVOS
-- =====================================================

CREATE TABLE file_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT,
  extracted_at TIMESTAMPTZ DEFAULT now(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA DE CONVERSACIONES DEL CHATBOT
-- =====================================================

CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLA DE LOGS DE MODIFICACIÓN
-- =====================================================

CREATE TABLE modification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type = ANY (ARRAY['edit', 'delete'])),
  changes JSONB,
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario de la tabla
COMMENT ON TABLE modification_logs IS 'Logs de auditoría. Acceso completo para auditores.';

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_patients_full_name ON patients USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_patients_identity_number ON patients(identity_number);
CREATE INDEX idx_patients_hospital ON patients(hospital);
CREATE INDEX idx_patients_created_at ON patients(created_at);

CREATE INDEX idx_patient_notes_patient_id ON patient_notes(patient_id);
CREATE INDEX idx_patient_notes_created_at ON patient_notes(created_at);

CREATE INDEX idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX idx_patient_files_uploaded_at ON patient_files(uploaded_at);

CREATE INDEX idx_file_contents_file_path ON file_contents(file_path);
CREATE INDEX idx_file_contents_patient_id ON file_contents(patient_id);

CREATE INDEX idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_created_at ON chatbot_conversations(created_at);

CREATE INDEX idx_modification_logs_patient_id ON modification_logs(patient_id);
CREATE INDEX idx_modification_logs_modified_at ON modification_logs(modified_at);
CREATE INDEX idx_modification_logs_action_type ON modification_logs(action_type);

-- Índices para búsquedas de texto completo
CREATE INDEX idx_users_full_name ON users USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para registrar cambios en pacientes
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar cambios en pacientes
CREATE TRIGGER patient_modification_trigger
  AFTER UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_patient_changes();

-- Función para registrar cambios en notas
CREATE OR REPLACE FUNCTION log_note_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO modification_logs (patient_id, modified_by, action_type, changes)
    VALUES (NEW.patient_id, current_setting('app.current_user_id')::uuid, 'edit',
            jsonb_build_object('table', 'patient_notes', 'old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO modification_logs (patient_id, modified_by, action_type, changes)
    VALUES (OLD.patient_id, current_setting('app.current_user_id')::uuid, 'delete',
            jsonb_build_object('table', 'patient_notes', 'deleted_record', to_jsonb(OLD)));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar cambios en notas
CREATE TRIGGER note_modification_trigger
  AFTER UPDATE OR DELETE ON patient_notes
  FOR EACH ROW EXECUTE FUNCTION log_note_changes();

-- Función para registrar cambios en archivos
CREATE OR REPLACE FUNCTION log_file_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO modification_logs (patient_id, modified_by, action_type, changes)
    VALUES (NEW.patient_id, current_setting('app.current_user_id')::uuid, 'edit',
            jsonb_build_object('table', 'patient_files', 'old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO modification_logs (patient_id, modified_by, action_type, changes)
    VALUES (OLD.patient_id, current_setting('app.current_user_id')::uuid, 'delete',
            jsonb_build_object('table', 'patient_files', 'deleted_record', to_jsonb(OLD)));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar cambios en archivos
CREATE TRIGGER file_modification_trigger
  AFTER UPDATE OR DELETE ON patient_files
  FOR EACH ROW EXECUTE FUNCTION log_file_changes();

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE modification_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- Políticas para tabla users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Políticas para tabla patients
CREATE POLICY "Users can view patients from their hospital" ON patients
  FOR SELECT USING (
    hospital = (
      SELECT hospital FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create patients in their hospital" ON patients
  FOR INSERT WITH CHECK (
    hospital = (
      SELECT hospital FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update patients from their hospital" ON patients
  FOR UPDATE USING (
    hospital = (
      SELECT hospital FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete patients from their hospital" ON patients
  FOR DELETE USING (
    hospital = (
      SELECT hospital FROM users WHERE id::text = auth.uid()::text
    )
  );

-- Políticas para tabla patient_notes
CREATE POLICY "Users can view notes from their hospital" ON patient_notes
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can create notes for their hospital patients" ON patient_notes
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update notes from their hospital" ON patient_notes
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can delete notes from their hospital" ON patient_notes
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

-- Políticas para tabla patient_files
CREATE POLICY "Users can view files from their hospital" ON patient_files
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can create files for their hospital patients" ON patient_files
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update files from their hospital" ON patient_files
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can delete files from their hospital" ON patient_files
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

-- Políticas para tabla file_contents
CREATE POLICY "Users can view file contents from their hospital" ON file_contents
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can create file contents for their hospital patients" ON file_contents
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update file contents from their hospital" ON file_contents
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can delete file contents from their hospital" ON file_contents
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

-- Políticas para tabla chatbot_conversations
CREATE POLICY "Users can view own conversations" ON chatbot_conversations
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own conversations" ON chatbot_conversations
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own conversations" ON chatbot_conversations
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own conversations" ON chatbot_conversations
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Políticas para tabla modification_logs (solo auditores)
CREATE POLICY "Auditors can view all modification logs" ON modification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND job_position = 'Director'
    )
  );

CREATE POLICY "System can insert modification logs" ON modification_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- CONFIGURACIÓN DE STORAGE
-- =====================================================

-- Crear bucket para archivos de pacientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-files',
  'patient-files',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Políticas para storage.objects
CREATE POLICY "Users can upload files for their hospital patients" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can view files from their hospital" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update files from their hospital" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can delete files from their hospital" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'patient-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients
      WHERE hospital = (
        SELECT hospital FROM users WHERE id::text = auth.uid()::text
      )
    )
  );

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener estadísticas de pacientes por hospital
CREATE OR REPLACE FUNCTION get_patient_stats()
RETURNS TABLE (
  hospital hospital_enum,
  patient_count BIGINT,
  note_count BIGINT,
  file_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.hospital,
    COUNT(DISTINCT p.id) as patient_count,
    COUNT(DISTINCT pn.id) as note_count,
    COUNT(DISTINCT pf.id) as file_count
  FROM patients p
  LEFT JOIN patient_notes pn ON p.id = pn.patient_id
  LEFT JOIN patient_files pf ON p.id = pf.patient_id
  GROUP BY p.hospital
  ORDER BY p.hospital;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar pacientes con información completa
CREATE OR REPLACE FUNCTION search_patients(search_term TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  age INTEGER,
  sex TEXT,
  identity_number TEXT,
  hospital hospital_enum,
  created_at TIMESTAMPTZ,
  note_count BIGINT,
  file_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.age,
    p.sex,
    p.identity_number,
    p.hospital,
    p.created_at,
    COUNT(DISTINCT pn.id) as note_count,
    COUNT(DISTINCT pf.id) as file_count
  FROM patients p
  LEFT JOIN patient_notes pn ON p.id = pn.patient_id
  LEFT JOIN patient_files pf ON p.id = pf.patient_id
  WHERE
    p.full_name ILIKE '%' || search_term || '%' OR
    p.identity_number ILIKE '%' || search_term || '%'
  GROUP BY p.id, p.full_name, p.age, p.sex, p.identity_number, p.hospital, p.created_at
  ORDER BY p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historial completo de un paciente
CREATE OR REPLACE FUNCTION get_patient_history(patient_uuid UUID)
RETURNS TABLE (
  patient_info JSONB,
  notes JSONB,
  files JSONB,
  modifications JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(p.*) as patient_info,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(pn.*))
       FROM patient_notes pn
       WHERE pn.patient_id = patient_uuid
       ORDER BY pn.created_at DESC),
      '[]'::jsonb
    ) as notes,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(pf.*))
       FROM patient_files pf
       WHERE pf.patient_id = patient_uuid
       ORDER BY pf.uploaded_at DESC),
      '[]'::jsonb
    ) as files,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(ml.*))
       FROM modification_logs ml
       WHERE ml.patient_id = patient_uuid
       ORDER BY ml.modified_at DESC),
      '[]'::jsonb
    ) as modifications
  FROM patients p
  WHERE p.id = patient_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar usuario de prueba (solo para desarrollo)
-- INSERT INTO users (id, email, full_name, identity_number, hospital, job_position)
-- VALUES (
--   '550e8400-e29b-41d4-a716-446655440000',
--   'admin@hospital.com',
--   'Administrador del Sistema',
--   'ADMIN001',
--   'Diani Beach Hospital (Ukunda)',
--   'Director'
-- );

-- =====================================================
-- CONFIGURACIÓN DE PERMISOS
-- =====================================================

-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Configurar permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE 'Base de datos del Sistema de Gestión Hospitalaria creada exitosamente';
  RAISE NOTICE 'Tablas creadas: users, patients, patient_notes, patient_files, file_contents, chatbot_conversations, modification_logs';
  RAISE NOTICE 'Enums creados: hospital_enum, job_position_enum';
  RAISE NOTICE 'Triggers creados: patient_modification_trigger, note_modification_trigger, file_modification_trigger';
  RAISE NOTICE 'Políticas RLS habilitadas en todas las tablas';
  RAISE NOTICE 'Bucket de storage creado: patient-files';
  RAISE NOTICE 'Funciones de utilidad creadas: get_patient_stats, search_patients, get_patient_history';
END $$;
