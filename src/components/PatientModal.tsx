'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Hash, Calendar, UserCheck } from 'lucide-react';
import { Patient } from '@/lib/supabase';

// Esquema de validación para pacientes
const patientSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  age: z
    .number()
    .min(0, 'La edad debe ser mayor a 0')
    .max(150, 'La edad debe ser menor a 150'),
  sex: z.enum(['male', 'female', 'other']).refine(val => val !== undefined, {
    message: 'Debes seleccionar el sexo',
  }),
  identity_number: z.string().min(1, 'El número de identidad es requerido'),
});

type PatientForm = z.infer<typeof patientSchema>;

interface PatientModalProps {
  patient?: Patient | null;
  onSubmit: (data: Partial<Patient>) => void;
  onClose: () => void;
}

export default function PatientModal({
  patient,
  onSubmit,
  onClose,
}: PatientModalProps) {
  const isEditing = !!patient;

  const form = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: patient?.full_name || '',
      age: patient?.age || 0,
      sex: patient?.sex || 'male',
      identity_number: patient?.identity_number || '',
    },
  });

  // Actualizar valores del formulario cuando cambie el paciente
  useEffect(() => {
    if (patient) {
      form.reset({
        full_name: patient.full_name,
        age: patient.age,
        sex: patient.sex,
        identity_number: patient.identity_number,
      });
    } else {
      form.reset({
        full_name: '',
        age: 0,
        sex: 'male',
        identity_number: '',
      });
    }
  }, [patient, form]);

  const handleSubmit = (data: PatientForm) => {
    onSubmit(data);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center space-x-3'>
            <div className='h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center'>
              {isEditing ? (
                <UserCheck className='h-5 w-5 text-blue-600' />
              ) : (
                <User className='h-5 w-5 text-blue-600' />
              )}
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                {isEditing ? 'Editar Paciente' : 'Agregar Paciente'}
              </h2>
              <p className='text-sm text-gray-500'>
                {isEditing
                  ? 'Modifica la información del paciente'
                  : 'Registra un nuevo paciente'}
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

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='p-6 space-y-6'
        >
          {/* Nombre completo */}
          <div>
            <label
              htmlFor='full_name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Nombre Completo
            </label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                {...form.register('full_name')}
                type='text'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Nombre completo del paciente'
              />
            </div>
            {form.formState.errors.full_name && (
              <p className='mt-1 text-sm text-red-600'>
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          {/* Número de identidad */}
          <div>
            <label
              htmlFor='identity_number'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Número de Identidad
            </label>
            <div className='relative'>
              <Hash className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                {...form.register('identity_number')}
                type='text'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Número de identidad o cédula'
              />
            </div>
            {form.formState.errors.identity_number && (
              <p className='mt-1 text-sm text-red-600'>
                {form.formState.errors.identity_number.message}
              </p>
            )}
          </div>

          {/* Edad */}
          <div>
            <label
              htmlFor='age'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Edad
            </label>
            <div className='relative'>
              <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                {...form.register('age', { valueAsNumber: true })}
                type='number'
                min='0'
                max='150'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Edad en años'
              />
            </div>
            {form.formState.errors.age && (
              <p className='mt-1 text-sm text-red-600'>
                {form.formState.errors.age.message}
              </p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label
              htmlFor='sex'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Sexo
            </label>
            <div className='grid grid-cols-3 gap-3'>
              <label className='flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                <input
                  {...form.register('sex')}
                  type='radio'
                  value='male'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                />
                <span className='ml-2 text-sm text-gray-700'>Masculino</span>
              </label>
              <label className='flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                <input
                  {...form.register('sex')}
                  type='radio'
                  value='female'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                />
                <span className='ml-2 text-sm text-gray-700'>Femenino</span>
              </label>
              <label className='flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                <input
                  {...form.register('sex')}
                  type='radio'
                  value='other'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                />
                <span className='ml-2 text-sm text-gray-700'>Otro</span>
              </label>
            </div>
            {form.formState.errors.sex && (
              <p className='mt-1 text-sm text-red-600'>
                {form.formState.errors.sex.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className='flex items-center justify-end space-x-3 pt-6 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {form.formState.isSubmitting
                ? isEditing
                  ? 'Guardando...'
                  : 'Creando...'
                : isEditing
                ? 'Guardar Cambios'
                : 'Crear Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
