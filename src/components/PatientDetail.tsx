'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Patient, PatientNote, PatientFile } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import {
  X,
  User,
  Calendar,
  Hash,
  Plus,
  FileText,
  Paperclip,
  Download,
  Trash2,
  Edit,
} from 'lucide-react';
import NoteModal from './NoteModal';
import FileUploadModal from './FileUploadModal';

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
  onPatientUpdated?: () => void;
}

export default function PatientDetail({
  patient,
  onClose,
  onPatientUpdated,
}: PatientDetailProps) {
  const { t, language } = useI18n();
  const { appUser } = useAuth();
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<PatientNote | null>(null);

  // Cargar notas y archivos del paciente
  const loadPatientData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar notas
      const { data: notesData, error: notesError } = await supabase
        .from('patient_notes')
        .select(
          `
          *,
          users (
            full_name,
            job_position
          )
        `
        )
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Cargar archivos
      const { data: filesData, error: filesError } = await supabase
        .from('patient_files')
        .select(
          `
          *,
          users (
            full_name
          )
        `
        )
        .eq('patient_id', patient.id)
        .order('uploaded_at', { ascending: false });

      if (filesError) throw filesError;

      setNotes(notesData || []);
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    loadPatientData();
  }, [patient.id, loadPatientData]);

  // Función para agregar/editar nota
  const handleNoteSubmit = async (noteData: Partial<PatientNote>) => {
    try {
      if (selectedNote) {
        // Editar nota existente
        const { error } = await supabase
          .from('patient_notes')
          .update(noteData)
          .eq('id', selectedNote.id);

        if (error) throw error;
      } else {
        // Crear nueva nota
        const { error } = await supabase.from('patient_notes').insert([
          {
            ...noteData,
            patient_id: patient.id,
            created_by: appUser?.id,
          },
        ]);

        if (error) throw error;
      }

      setShowNoteModal(false);
      setSelectedNote(null);

      // Recargar datos inmediatamente
      await loadPatientData();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // Función para eliminar nota
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    try {
      const { error } = await supabase
        .from('patient_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      loadPatientData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Función para editar nota
  const handleEditNote = (note: PatientNote) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  // Función para descargar archivo
  const handleDownloadFile = async (file: PatientFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('patient-files')
        .download(file.file_url);

      if (error) throw error;

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_url.split('/').pop() || 'archivo';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Función para eliminar archivo
  const handleDeleteFile = async (file: PatientFile) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('patient-files')
        .remove([file.file_url]);

      if (storageError) throw storageError;

      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('patient_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      loadPatientData();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Función para formatear la fecha según el idioma
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'es' ? 'es-ES' : language === 'sw' ? 'sw-TZ' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center space-x-3'>
            <div className='h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center'>
              <User className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                {t('dashboard.patientRecord')}
              </h2>
              <p className='text-sm text-gray-500'>
                {patient.full_name} - ID: {patient.identity_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Patient Info */}
        <div className='p-6 border-b bg-gray-50'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center space-x-2'>
              <User className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {t('patients.name')}:
              </span>
              <span className='text-sm font-medium'>{patient.full_name}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Hash className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>ID:</span>
              <span className='text-sm font-medium'>
                {patient.identity_number}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {t('patients.age')}:
              </span>
              <span className='text-sm font-medium'>
                {t('patients.years', { count: patient.age })}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>
                {t('patients.sex')}:
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  patient.sex === 'male'
                    ? 'bg-blue-100 text-blue-800'
                    : patient.sex === 'female'
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {patient.sex === 'male'
                  ? t('patients.male')
                  : patient.sex === 'female'
                  ? t('patients.female')
                  : t('patients.other')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className='flex border-b'>
          <button className='flex-1 py-3 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600'>
            {t('notes.title')} ({notes.length})
          </button>
          <button className='flex-1 py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700'>
            {t('files.title')} ({files.length})
          </button>
        </div>

        {/* Notes Section */}
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-medium text-gray-900'>
              {t('notes.title')}
            </h3>
            <button
              onClick={() => setShowNoteModal(true)}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus className='h-4 w-4' />
              <span>{t('notes.addNote')}</span>
            </button>
          </div>

          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>{t('notes.loading')}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className='text-center py-8'>
              <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                {t('notes.noNotes')}
              </h4>
              <p className='text-gray-600'>{t('notes.addFirstNote')}</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {notes.map(note => (
                <div
                  key={note.id}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm font-medium text-gray-900'>
                        Dr. {note.users?.full_name}
                      </span>
                      <span className='text-sm text-gray-500'>
                        ({note.users?.job_position})
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm text-gray-500'>
                        {formatDate(note.created_at)}
                      </span>
                      <button
                        onClick={() => handleEditNote(note)}
                        className='text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className='text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>

                  {note.diagnosis && (
                    <div className='mb-3'>
                      <h5 className='text-sm font-medium text-gray-700 mb-1'>
                        {t('notes.diagnosis')}:
                      </h5>
                      <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-md'>
                        {note.diagnosis}
                      </p>
                    </div>
                  )}

                  {note.treatment && (
                    <div className='mb-3'>
                      <h5 className='text-sm font-medium text-gray-700 mb-1'>
                        {t('notes.treatment')}:
                      </h5>
                      <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-md'>
                        {note.treatment}
                      </p>
                    </div>
                  )}

                  {note.observations && (
                    <div>
                      <h5 className='text-sm font-medium text-gray-700 mb-1'>
                        {t('notes.observations')}:
                      </h5>
                      <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-md'>
                        {note.observations}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files Section */}
        <div className='p-6 border-t'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-medium text-gray-900'>
              {t('files.title')}
            </h3>
            <button
              onClick={() => setShowFileModal(true)}
              className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <Paperclip className='h-4 w-4' />
              <span>{t('files.uploadFile')}</span>
            </button>
          </div>

          {files.length === 0 ? (
            <div className='text-center py-8'>
              <Paperclip className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                {t('files.noFiles')}
              </h4>
              <p className='text-gray-600'>{t('files.addFirstFile')}</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {files.map(file => (
                <div
                  key={file.id}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      <Paperclip className='h-4 w-4 text-gray-400' />
                      <span className='text-sm font-medium text-gray-900 truncate'>
                        {file.file_url.split('/').pop()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className='text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                  <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                    <span>
                      {t('files.uploadedBy')}: {file.users?.full_name}
                    </span>
                    <span>{formatDate(file.uploaded_at)}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className='w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors'
                  >
                    <Download className='h-4 w-4' />
                    <span>{t('files.download')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNoteModal && (
        <NoteModal
          note={selectedNote}
          onSubmit={handleNoteSubmit}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedNote(null);
          }}
        />
      )}

      {showFileModal && (
        <FileUploadModal
          patientId={patient.id}
          onClose={() => setShowFileModal(false)}
          onFileUploaded={loadPatientData}
        />
      )}
    </div>
  );
}
