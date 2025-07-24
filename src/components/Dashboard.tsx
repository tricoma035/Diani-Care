'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Patient, supabase } from '@/lib/supabase';
import {
  Building2,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Chatbot from './Chatbot';
import LanguageSelector from './LanguageSelector';
import LoadingFallback from './LoadingFallback';
import PatientDetail from './PatientDetail';
import PatientList from './PatientList';
import PatientModal from './PatientModal';

type SortOption = 'full_name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
  const { appUser, signOut, refreshSession } = useAuth();
  const { t } = useI18n();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('full_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Cargar pacientes
  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('patients')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,identity_number.ilike.%${searchTerm}%`
        );
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setPatients(data || []);
    } catch {
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrder]);

  // Cargar pacientes cuando cambien los filtros
  useEffect(() => {
    loadPatients();
  }, [searchTerm, sortBy, sortOrder, loadPatients]);

  // Función para agregar/editar paciente
  const handlePatientSubmit = async (patientData: Partial<Patient>) => {
    try {
      if (editingPatient) {
        // Editar paciente existente
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editingPatient.id);

        if (error) {
          throw error;
        }

        // Registrar la modificación
        await supabase.from('modification_logs').insert([
          {
            patient_id: editingPatient.id,
            modified_by: appUser?.id,
            action_type: 'edit',
            changes: patientData,
          },
        ]);
      } else {
        // Crear nuevo paciente
        const { error } = await supabase.from('patients').insert([
          {
            ...patientData,
            created_by: appUser?.id,
            hospital: appUser?.hospital,
          },
        ]);

        if (error) {
          throw error;
        }
      }

      setShowPatientModal(false);
      setEditingPatient(null);
      await loadPatients();

      // Refrescar sesión tras mutación para evitar problemas de carga infinita
      await refreshSession();
    } catch {
      // Error al guardar paciente
    }
  };

  // Función para eliminar paciente
  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        throw error;
      }

      // Registrar la modificación
      await supabase.from('modification_logs').insert([
        {
          patient_id: patientId,
          modified_by: appUser?.id,
          action_type: 'delete',
          changes: { deleted: true },
        },
      ]);

      await loadPatients();

      // Refrescar sesión tras mutación para evitar problemas de carga infinita
      await refreshSession();
    } catch {
      // Error al eliminar paciente
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientModal(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleClosePatientDetail = () => {
    setSelectedPatient(null);
  };

  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Mostrar fallback si hay error o carga
  if (error) {
    return (
      <LoadingFallback
        message={error}
        showRetry={true}
        onRetry={loadPatients}
      />
    );
  }

  if (loading) {
    return <LoadingFallback message='Cargando pacientes...' />;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Building2 className='h-8 w-8 text-primary-600' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  {t('dashboard.title')}
                </h1>
                <p className='text-sm text-gray-500'>
                  {appUser?.hospital} - {appUser?.full_name}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <LanguageSelector />
              <button
                onClick={() => setShowChatbot(true)}
                className='flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-medical hover:bg-primary-700 transition-colors'
              >
                <MessageCircle className='h-4 w-4' />
                <span>{t('dashboard.chatbot')}</span>
              </button>
              <button
                onClick={signOut}
                className='flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-medical hover:bg-gray-300 transition-colors'
              >
                <LogOut className='h-4 w-4' />
                <span>{t('dashboard.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search and Filters */}
        <div className='mb-6 flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-medical focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => handleSort('full_name')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-medical border transition-colors ${
                sortBy === 'full_name'
                  ? 'bg-primary-100 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{t('dashboard.name')}</span>
              {sortBy === 'full_name' ? (
                sortOrder === 'asc' ? (
                  <SortAsc className='h-4 w-4' />
                ) : (
                  <SortDesc className='h-4 w-4' />
                )
              ) : (
                <SortAsc className='h-4 w-4 text-gray-400' />
              )}
            </button>

            <button
              onClick={() => handleSort('created_at')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-medical border transition-colors ${
                sortBy === 'created_at'
                  ? 'bg-primary-100 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{t('dashboard.date')}</span>
              {sortBy === 'created_at' ? (
                sortOrder === 'asc' ? (
                  <SortAsc className='h-4 w-4' />
                ) : (
                  <SortDesc className='h-4 w-4' />
                )
              ) : (
                <SortAsc className='h-4 w-4 text-gray-400' />
              )}
            </button>

            <button
              onClick={() => setShowPatientModal(true)}
              className='flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-medical hover:bg-primary-700 transition-colors'
            >
              <Plus className='h-4 w-4' />
              <span>{t('dashboard.addPatient')}</span>
            </button>
          </div>
        </div>

        {/* Patient List */}
        <PatientList
          patients={patients}
          loading={loading}
          onEditAction={handleEditPatient}
          onDeleteAction={handleDeletePatient}
          onViewAction={handleViewPatient}
        />
      </main>

      {/* Modals */}
      {showPatientModal && (
        <PatientModal
          patient={editingPatient}
          onSubmitAction={handlePatientSubmit}
          onCloseAction={() => {
            setShowPatientModal(false);
            setEditingPatient(null);
          }}
        />
      )}

      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          onCloseAction={handleClosePatientDetail}
        />
      )}

      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
