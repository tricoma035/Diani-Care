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
  fileName: string
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
      return { content: text, fileType: 'txt' };
    }
    // PDF
    if (fileExtension === 'pdf') {
      try {
        const arrayBuffer = await data.arrayBuffer();
        const pdfParse = await import('pdf-parse');
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse.default(buffer);
        if (pdfData.text && pdfData.text.trim().length > 0) {
          return { content: pdfData.text, fileType: 'pdf' };
        }
        return {
          content: 'PDF subido. No se pudo extraer texto automáticamente.',
          fileType: 'pdf',
        };
      } catch {
        return {
          content: 'PDF subido. No se pudo extraer texto automáticamente.',
          fileType: 'pdf',
        };
      }
    }
    // DOCX
    if (fileExtension === 'docx') {
      try {
        const arrayBuffer = await data.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.default.extractRawText({ arrayBuffer });
        return {
          content:
            result.value ||
            'DOCX subido. No se pudo extraer texto automáticamente.',
          fileType: 'docx',
        };
      } catch {
        return {
          content: 'DOCX subido. No se pudo extraer texto automáticamente.',
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
          return { content: ocrData.text, fileType: fileExtension };
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
    const { content, fileType } = await extractTextFromFile(fileUrl, fileName);
    // Guardar SIEMPRE un registro en la base de datos
    const { error: insertError } = await supabase.from('file_contents').insert({
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
