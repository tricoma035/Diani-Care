'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { AlertCircle, File, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface FileUploadModalProps {
  patientId: string;
  onCloseAction: () => void;
  onFileUploadedAction: () => void;
}

export default function FileUploadModal({
  patientId,
  onCloseAction,
  onFileUploadedAction,
}: FileUploadModalProps) {
  const { appUser, refreshSession } = useAuth();
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          'Tipo de archivo no permitido. Solo se permiten imágenes, PDFs, documentos de Word y archivos de texto.'
        );
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !appUser) {
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);

      // Generar nombre único para el archivo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${patientId}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(50);

      // Obtener URL pública del archivo
      supabase.storage.from('patient-files').getPublicUrl(fileName);

      setUploadProgress(75);

      // Guardar registro en la base de datos
      const { error: dbError } = await supabase.from('patient_files').insert([
        {
          patient_id: patientId,
          file_url: fileName,
          uploaded_by: appUser.id,
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      setUploadProgress(90);

      // Procesar y extraer contenido del archivo
      try {
        const processResponse = await fetch('/api/process-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileUrl: fileName,
            fileName: selectedFile.name,
            patientId,
          }),
        });

        const processResult = await processResponse.json();

        if (processResult.success) {
        } else {
        }
      } catch (error) {}

      setUploadProgress(100);

      // Limpiar y cerrar
      setSelectedFile(null);
      onFileUploadedAction();
      onCloseAction();

      // Refrescar sesión tras mutación para evitar problemas de carga infinita
      await refreshSession();
    } catch (error) {
      setError('Error al subir el archivo. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      input.onchange = e =>
        handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
      input.click();
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center space-x-3'>
            <div className='h-10 w-10 bg-green-100 rounded-full flex items-center justify-center'>
              <Upload className='h-5 w-5 text-green-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                {t('files.uploadFile')}
              </h2>
              <p className='text-sm text-gray-500'>
                {t('files.uploadFileSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Error Message */}
          {error && (
            <div className='mb-4 bg-red-50 border border-red-200 rounded-md p-4'>
              <div className='flex items-center space-x-2'>
                <AlertCircle className='h-5 w-5 text-red-600' />
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {selectedFile ? (
              <div className='space-y-4'>
                <File className='h-12 w-12 text-green-600 mx-auto' />
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    {t('files.selectedFile')}
                  </h3>
                  <p className='text-sm text-gray-600 mb-4'>
                    {selectedFile.name}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {t('files.fileSize', {
                      size: (selectedFile.size / 1024 / 1024).toFixed(2),
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className='text-sm text-red-600 hover:text-red-700'
                >
                  {t('files.selectAnotherFile')}
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                <Upload className='h-12 w-12 text-gray-400 mx-auto' />
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    {t('files.dragAndDrop')}
                  </h3>
                  <p className='text-sm text-gray-600 mb-4'>
                    {t('files.orClickToSelect')}
                  </p>
                </div>
                <label className='cursor-pointer'>
                  <input
                    type='file'
                    onChange={handleFileSelect}
                    className='hidden'
                    accept='.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt'
                  />
                  <span className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                    {t('files.selectFile')}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className='mt-6'>
              <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
                <span>
                  {uploadProgress < 50
                    ? t('files.uploading')
                    : uploadProgress < 90
                    ? 'Guardando archivo...'
                    : 'Procesando contenido...'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* File Types Info */}
          <div className='mt-6 bg-gray-50 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>
              {t('files.fileTypes')}
            </h4>
            <ul className='text-xs text-gray-600 space-y-1'>
              <li>{t('files.fileTypesImages')}</li>
              <li>{t('files.fileTypesDocs')}</li>
              <li>{t('files.fileTypesText')}</li>
              <li>{t('files.maxSize')}</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className='flex items-center justify-end space-x-3 p-6 border-t'>
          <button
            onClick={onCloseAction}
            disabled={isUploading}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isUploading ? t('files.uploading') : t('files.uploadFile')}
          </button>
        </div>
      </div>
    </div>
  );
}
