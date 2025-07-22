'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, FileText, Stethoscope, Pill, Eye } from 'lucide-react'
import { PatientNote } from '@/lib/supabase'

// Esquema de validación para notas médicas
const noteSchema = z.object({
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  treatment: z.string().min(1, 'El tratamiento es requerido'),
  observations: z.string().optional()
})

type NoteForm = z.infer<typeof noteSchema>

interface NoteModalProps {
  note?: PatientNote | null
  onSubmit: (data: Partial<PatientNote>) => void
  onClose: () => void
}

export default function NoteModal({ note, onSubmit, onClose }: NoteModalProps) {
  const isEditing = !!note

  const form = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      diagnosis: note?.diagnosis || '',
      treatment: note?.treatment || '',
      observations: note?.observations || ''
    }
  })

  // Actualizar valores del formulario cuando cambie la nota
  useEffect(() => {
    if (note) {
      form.reset({
        diagnosis: note.diagnosis || '',
        treatment: note.treatment || '',
        observations: note.observations || ''
      })
    } else {
      form.reset({
        diagnosis: '',
        treatment: '',
        observations: ''
      })
    }
  }, [note, form])

  const handleSubmit = (data: NoteForm) => {
    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Editar Nota Médica' : 'Agregar Nota Médica'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Modifica la información de la nota' : 'Registra una nueva nota médica'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
          {/* Diagnóstico */}
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...form.register('diagnosis')}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe el diagnóstico del paciente..."
              />
            </div>
            {form.formState.errors.diagnosis && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.diagnosis.message}
              </p>
            )}
          </div>

          {/* Tratamiento */}
          <div>
            <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <div className="relative">
              <Pill className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...form.register('treatment')}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe el tratamiento prescrito..."
              />
            </div>
            {form.formState.errors.treatment && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.treatment.message}
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (Opcional)
            </label>
            <div className="relative">
              <Eye className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...form.register('observations')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Agrega observaciones adicionales..."
              />
            </div>
            {form.formState.errors.observations && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.observations.message}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Información de la Nota
                </h4>
                <p className="text-sm text-blue-700">
                  Esta nota será registrada con tu información profesional y fecha actual. 
                  Los campos de diagnóstico y tratamiento son obligatorios para mantener 
                  un registro médico completo.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {form.formState.isSubmitting 
                ? (isEditing ? 'Guardando...' : 'Creando...') 
                : (isEditing ? 'Guardar Cambios' : 'Crear Nota')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 