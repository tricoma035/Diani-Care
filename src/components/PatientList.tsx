'use client';

import { Patient } from '@/lib/supabase';
import { Edit, Trash2, Eye, User, Calendar } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onView: (patient: Patient) => void;
}

export default function PatientList({
  patients,
  loading,
  onEdit,
  onDelete,
  onView,
}: PatientListProps) {
  const { t, language } = useI18n();

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow'>
        <div className='p-8 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>{t('patients.loading')}</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow'>
        <div className='p-8 text-center'>
          <User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            {t('patients.noPatients')}
          </h3>
          <p className='text-gray-600'>{t('patients.addFirstPatient')}</p>
        </div>
      </div>
    );
  }

  // Función para formatear la fecha según el idioma
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'es' ? 'es-ES' : language === 'sw' ? 'sw-TZ' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('patients.tableHeaders.patient')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('patients.tableHeaders.info')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('patients.tableHeaders.createdAt')}
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('patients.tableHeaders.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {patients.map(patient => (
              <tr
                key={patient.id}
                className='hover:bg-gray-50 transition-colors'
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                      <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                        <User className='h-5 w-5 text-blue-600' />
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {patient.full_name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        ID: {patient.identity_number}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    <div className='flex items-center space-x-2'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                        {t('patients.years', { count: patient.age })}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center text-sm text-gray-500'>
                    <Calendar className='h-4 w-4 mr-2' />
                    {formatDate(patient.created_at)}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex items-center justify-end space-x-2'>
                    <button
                      onClick={() => onView(patient)}
                      className='text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors'
                      title={t('patients.viewDetails')}
                    >
                      <Eye className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => onEdit(patient)}
                      className='text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors'
                      title={t('patients.editPatient')}
                    >
                      <Edit className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => onDelete(patient.id)}
                      className='text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors'
                      title={t('patients.deletePatient')}
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className='bg-gray-50 px-6 py-3 border-t border-gray-200'>
        <div className='flex items-center justify-between text-sm text-gray-600'>
          <span>
            {t('patients.total', { count: patients.length })}
            <span className='font-medium'>{patients.length}</span>
          </span>
          <div className='flex items-center space-x-4'>
            <span className='flex items-center'>
              <User className='h-4 w-4 mr-1' />
              {patients.filter(p => p.sex === 'male').length}{' '}
              {t('patients.male', {
                count: patients.filter(p => p.sex === 'male').length,
              })}
            </span>
            <span className='flex items-center'>
              <User className='h-4 w-4 mr-1' />
              {patients.filter(p => p.sex === 'female').length}{' '}
              {t('patients.female', {
                count: patients.filter(p => p.sex === 'female').length,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
