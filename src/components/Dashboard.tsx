'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Patient } from '@/lib/supabase';
import {
  Search,
  LogOut,
  Building2,
  Plus,
  SortAsc,
  SortDesc,
  MessageCircle,
} from 'lucide-react';
import PatientList from './PatientList';
import PatientModal from './PatientModal';
import PatientDetail from './PatientDetail';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '@/lib/i18n';
import Chatbot from './Chatbot';

type SortOption = 'full_name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
  const { appUser, signOut } = useAuth();
  const { t } = useI18n();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
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
      let query = supabase
        .from('patients')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,identity_number.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
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

        if (error) throw error;

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

        if (error) throw error;
      }

      setShowPatientModal(false);
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  // Función para eliminar paciente
  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paciente?'))
      return;

    try {
      // Registrar la eliminación antes de eliminar
      await supabase.from('modification_logs').insert([
        {
          patient_id: patientId,
          modified_by: appUser?.id || '',
          action_type: 'delete',
          changes: { deleted: true },
        },
      ]);

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  // Función para editar paciente
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientModal(true);
  };

  // Función para ver detalles del paciente
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  // Función para cerrar detalles del paciente
  const handleClosePatientDetail = () => {
    setSelectedPatient(null);
  };

  // Función para cambiar orden de clasificación
  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Building2 className='h-8 w-8 text-blue-600' />
              {/* Contenido del header - versión desktop */}
              <div className='hidden md:block'>
                <h1 className='text-xl font-semibold text-gray-900'>
                  {t('dashboard.title')}
                </h1>
                <p className='text-sm text-gray-500'>
                  {t('dashboard.subtitle')}
                </p>
                <p className='text-sm text-gray-500'>
                  {appUser?.hospital} - {appUser?.full_name}
                </p>
              </div>
              {/* Contenido del header - versión móvil */}
              <div className='md:hidden flex items-center space-x-3'>
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-gray-900'>
                    {appUser?.full_name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {appUser?.hospital?.split(' ')[0] || 'Hospital'}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2 sm:space-x-4'>
              <LanguageSelector />
              <button
                onClick={signOut}
                className='flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <LogOut className='h-4 w-4' />
                <span className='hidden sm:inline'>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search and Filters */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder={t('patients.searchPatients')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <button
                onClick={() => setShowPatientModal(true)}
                className='flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
              >
                <Plus className='h-4 w-4' />
                <span className='hidden sm:inline'>
                  {t('patients.addPatient')}
                </span>
                <span className='sm:hidden'>+</span>
              </button>
              <button
                onClick={() => handleSort('full_name')}
                className='hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <span>{t('patients.fullName')}</span>
                {sortBy === 'full_name' ? (
                  sortOrder === 'asc' ? (
                    <SortAsc className='h-4 w-4' />
                  ) : (
                    <SortDesc className='h-4 w-4' />
                  )
                ) : null}
              </button>
              <button
                onClick={() => handleSort('created_at')}
                className='hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <span>{t('patients.createdAt')}</span>
                {sortBy === 'created_at' ? (
                  sortOrder === 'asc' ? (
                    <SortAsc className='h-4 w-4' />
                  ) : (
                    <SortDesc className='h-4 w-4' />
                  )
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <PatientList
          patients={patients}
          loading={loading}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onView={handleViewPatient}
        />

        {/* Modals */}
        {showPatientModal && (
          <PatientModal
            patient={editingPatient}
            onSubmit={handlePatientSubmit}
            onClose={() => {
              setShowPatientModal(false);
              setEditingPatient(null);
            }}
          />
        )}

        {selectedPatient && (
          <PatientDetail
            patient={selectedPatient}
            onClose={handleClosePatientDetail}
            onPatientUpdated={loadPatients}
          />
        )}
      </main>
      {/* Botón flotante para el chatbot */}
      <button
        onClick={() => setShowChatbot(true)}
        className='fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
        aria-label='Abrir Chatbot'
      >
        <MessageCircle className='h-6 w-6' />
      </button>
      {/* Modal o panel del chatbot */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
