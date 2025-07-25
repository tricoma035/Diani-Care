import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Inicializar Supabase admin client con la service role key (solo backend)
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error(
    'Supabase URL o Service Role Key no configuradas en el entorno.'
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para extraer texto de diferentes tipos de archivos
async function extractTextFromFile(
  fileUrl: string,
  fileName: string,
  patientId?: string
): Promise<{ content: string; fileType: string }> {
  try {
    const filePath = fileUrl.replace(
      '/storage/v1/object/public/patient-files/',
      ''
    );
    const { data, error } = await supabase.storage
      .from('patient-files')
      .download(filePath);
    if (error || !data) {
      return {
        content: `Error descargando archivo: ${
          error?.message || 'desconocido'
        }`,
        fileType: 'unknown',
      };
    }
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'unknown';
    // TXT
    if (fileExtension === 'txt') {
      const text = await data.text();
      if (text && text.trim().length > 0) {
        // Dividir el contenido en chunks de máximo 1000 caracteres
        const trimmedText = text.trim();
        const chunks = [];
        for (let i = 0; i < trimmedText.length; i += 1000) {
          chunks.push(trimmedText.slice(i, i + 1000));
        }

        // Guardar cada chunk como un registro separado
        for (let i = 0; i < chunks.length; i++) {
          const chunkContent = chunks[i];
          const { error: chunkError } = await supabase
            .from('file_contents')
            .insert({
              file_path: fileUrl,
              file_name: `${fileName} (parte ${i + 1}/${chunks.length})`,
              file_type: 'txt',
              content: chunkContent,
              patient_id: patientId,
            });

          if (chunkError) {
            // Error guardando chunk TXT
          }
        }

        return {
          content: `TXT procesado correctamente. ${chunks.length} partes extraídas.`,
          fileType: 'txt',
        };
      }
      return { content: 'Archivo TXT vacío o sin contenido.', fileType: 'txt' };
    }
    // PDF
    if (fileExtension === 'pdf') {
      try {
        const arrayBuffer = await data.arrayBuffer();

        // Verificar que el buffer no esté vacío
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          return {
            content: 'PDF vacío o no descargado correctamente.',
            fileType: 'pdf',
          };
        }

        // Usar pdf-parse importando directamente el módulo interno para evitar código de prueba
        // @ts-expect-error: Importación directa del módulo interno de pdf-parse
        const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse.default(buffer);

        if (pdfData.text && pdfData.text.trim().length > 0) {
          // Dividir el contenido en chunks de máximo 1000 caracteres
          const text = pdfData.text.trim();
          const chunks = [];
          for (let i = 0; i < text.length; i += 1000) {
            chunks.push(text.slice(i, i + 1000));
          }

          // Guardar cada chunk como un registro separado
          for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];
            const { error: chunkError } = await supabase
              .from('file_contents')
              .insert({
                file_path: fileUrl,
                file_name: `${fileName} (parte ${i + 1}/${chunks.length})`,
                file_type: 'pdf',
                content: chunkContent,
                patient_id: patientId,
              });

            if (chunkError) {
              // Error guardando chunk
            }
          }

          return {
            content: `PDF procesado correctamente. ${chunks.length} partes extraídas.`,
            fileType: 'pdf',
          };
        }

        return {
          content: 'PDF subido. No se pudo extraer texto automáticamente.',
          fileType: 'pdf',
        };
      } catch (error) {
        return {
          content: `Error procesando PDF: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`,
          fileType: 'pdf',
        };
      }
    }
    // DOCX
    if (fileExtension === 'docx') {
      try {
        const arrayBuffer = await data.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.default.extractRawText({
          buffer: Buffer.from(arrayBuffer),
        });

        if (result.value && result.value.trim().length > 0) {
          // Dividir el contenido en chunks de máximo 1000 caracteres
          const text = result.value.trim();
          const chunks = [];
          for (let i = 0; i < text.length; i += 1000) {
            chunks.push(text.slice(i, i + 1000));
          }

          // Guardar cada chunk como un registro separado
          for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];
            const { error: chunkError } = await supabase
              .from('file_contents')
              .insert({
                file_path: fileUrl,
                file_name: `${fileName} (parte ${i + 1}/${chunks.length})`,
                file_type: 'docx',
                content: chunkContent,
                patient_id: patientId,
              });

            if (chunkError) {
              // Error guardando chunk DOCX
            }
          }

          return {
            content: `DOCX procesado correctamente. ${chunks.length} partes extraídas.`,
            fileType: 'docx',
          };
        }

        return {
          content: 'DOCX subido. No se pudo extraer texto automáticamente.',
          fileType: 'docx',
        };
      } catch (error) {
        return {
          content: `Error procesando DOCX: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`,
          fileType: 'docx',
        };
      }
    }
    // Imágenes (OCR)
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      try {
        const arrayBuffer = await data.arrayBuffer();
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker();
        await worker.load();
        // Corrección: usar la API correcta para TypeScript
        // @ts-expect-error: loadLanguage e initialize existen en tiempo de ejecución
        await worker.loadLanguage('spa');
        // @ts-expect-error: loadLanguage e initialize existen en tiempo de ejecución
        await worker.initialize('spa');
        const { data: ocrData } = await worker.recognize(
          Buffer.from(arrayBuffer)
        );
        await worker.terminate();
        if (ocrData.text && ocrData.text.trim().length > 0) {
          // Dividir el contenido en chunks de máximo 1000 caracteres
          const text = ocrData.text.trim();
          const chunks = [];
          for (let i = 0; i < text.length; i += 1000) {
            chunks.push(text.slice(i, i + 1000));
          }

          // Guardar cada chunk como un registro separado
          for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];
            const { error: chunkError } = await supabase
              .from('file_contents')
              .insert({
                file_path: fileUrl,
                file_name: `${fileName} (parte ${i + 1}/${chunks.length})`,
                file_type: fileExtension,
                content: chunkContent,
                patient_id: patientId,
              });

            if (chunkError) {
              // Error guardando chunk imagen
            }
          }

          return {
            content: `Imagen procesada correctamente. ${chunks.length} partes extraídas.`,
            fileType: fileExtension,
          };
        }
        return {
          content: 'Imagen subida. No se pudo extraer texto automáticamente.',
          fileType: fileExtension,
        };
      } catch {
        return {
          content: 'Imagen subida. No se pudo extraer texto automáticamente.',
          fileType: fileExtension,
        };
      }
    }
    // Otros tipos
    return {
      content: 'Archivo subido. Tipo no soportado para extracción automática.',
      fileType: fileExtension,
    };
  } catch {
    return {
      content: `Error general procesando archivo: `,
      fileType: 'unknown',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fileUrl, fileName, patientId } = await req.json();
    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'fileUrl y fileName son requeridos' },
        { status: 400 }
      );
    }
    // Extraer contenido del archivo
    const { content, fileType } = await extractTextFromFile(
      fileUrl,
      fileName,
      patientId
    );

    // Solo guardar un registro adicional si no se guardaron chunks (para archivos no soportados)
    if (!content.includes('procesado correctamente')) {
      const { error: insertError } = await supabase
        .from('file_contents')
        .insert({
          file_path: fileUrl,
          file_name: fileName,
          file_type: fileType,
          content,
          patient_id: patientId,
        });
      if (insertError) {
        return NextResponse.json(
          { error: 'Error guardando contenido del archivo' },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({
      success: true,
      message: 'Archivo procesado y guardado correctamente',
      fileType,
      contentLength: content.length,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
