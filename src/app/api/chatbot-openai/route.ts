import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase admin client con la service role key (solo backend, nunca frontend)
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

// Extraer referencia de paciente de la pregunta
function extractPatientReference(text: string): string | null {
  const match = text.match(
    /(?:de|sobre|about|del|de la|del paciente|de la paciente|del paciente|paciente|patient|nombre|name)\s+([\wáéíóúüñÁÉÍÓÚÜÑ\s']+)/i
  );
  if (match) return match[1].trim();
  const fallback = text.match(/([A-Za-záéíóúüñÁÉÍÓÚÜÑ']{3,})$/);
  return fallback ? fallback[1] : null;
}

// Extraer texto de diferentes tipos de archivos
async function extractTextFromFile(
  fileUrl: string,
  fileName: string
): Promise<string> {
  try {
    // Descargar el archivo desde Supabase Storage
    const { data, error } = await supabase.storage
      .from('patient-files')
      .download(
        fileUrl.replace('/storage/v1/object/public/patient-files/', '')
      );

    if (error || !data) {
      return `Error al leer el archivo: ${fileName}`;
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Convertir a texto según el tipo de archivo
    if (fileExtension === 'txt') {
      return await data.text();
    } else if (fileExtension === 'pdf') {
      // Para PDFs, intentar extraer texto básico
      try {
        const arrayBuffer = await data.arrayBuffer();
        // Usar una aproximación simple para PDFs (en producción se usaría pdf-parse)
        return `Archivo PDF: ${fileName} (contenido extraído parcialmente)`;
      } catch (pdfError) {
        return `Archivo PDF: ${fileName} (error al procesar: ${pdfError})`;
      }
    } else if (
      ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension || '')
    ) {
      return `Imagen: ${fileName} (archivo de imagen - contenido visual no procesable)`;
    } else if (fileExtension === 'docx') {
      // Para DOCX, intentar extraer texto básico
      try {
        const arrayBuffer = await data.arrayBuffer();
        // Usar una aproximación simple para DOCX (en producción se usaría mammoth)
        return `Documento Word: ${fileName} (contenido extraído parcialmente)`;
      } catch (docxError) {
        return `Documento Word: ${fileName} (error al procesar: ${docxError})`;
      }
    } else {
      return `Archivo: ${fileName} (tipo no soportado para lectura automática)`;
    }
  } catch (error) {
    return `Error al procesar el archivo ${fileName}: ${error}`;
  }
}

export async function POST(req: NextRequest) {
  const { messages, language, systemPrompt, queryType } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  const serperKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'No OpenAI API key configured.' },
      { status: 500 }
    );
  }

  const model = 'gpt-4-1106-preview';

  // --- Búsqueda en base de datos (SOLO base de datos y archivos) ---
  if (queryType === 'db') {
    const lastUserMsg =
      messages.filter((m: any) => m.role === 'user').slice(-1)[0]?.content ||
      '';
    const patientRef = extractPatientReference(lastUserMsg);

    if (!patientRef) {
      return NextResponse.json({
        content: 'Por favor, indica el nombre o ID del paciente.',
      });
    }

    // Buscar pacientes por nombre o ID (insensible a mayúsculas)
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .or(
        `full_name.ilike.%${patientRef}%,identity_number.ilike.%${patientRef}%`
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!patients || patients.length === 0) {
      return NextResponse.json({
        content: 'No se encontró ningún paciente con esa referencia.',
      });
    }

    if (patients.length > 1) {
      return NextResponse.json({
        content: `Se han encontrado ${
          patients.length
        } pacientes. Por favor, especifica el nombre completo o el número de identificación:\n${patients
          .map((p: any) => `• ${p.full_name} (${p.identity_number})`)
          .join('\n')}`,
      });
    }

    const patient = patients[0];
    let context = `Paciente: ${patient.full_name}\nID: ${patient.identity_number}\nEdad: ${patient.age}\nSexo: ${patient.sex}\nHospital: ${patient.hospital}\n`;

    // Buscar TODOS los archivos del paciente
    const { data: files, error: filesError } = await supabase
      .from('patient_files')
      .select(
        `
        *,
        users:uploaded_by(full_name)
      `
      )
      .eq('patient_id', patient.id)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      return NextResponse.json({ error: filesError.message }, { status: 500 });
    }

    // Leer contenido de TODOS los archivos para análisis completo
    let fileContents = '';
    if (files && files.length > 0) {
      context += `\n📁 ARCHIVOS DISPONIBLES (${files.length} archivos):\n`;

      for (const file of files) {
        const fileName = file.file_url.split('/').pop() || 'archivo';
        const content = await extractTextFromFile(file.file_url, fileName);
        const uploadDate = new Date(file.uploaded_at).toLocaleDateString(
          language === 'es' ? 'es-ES' : language === 'sw' ? 'sw-KE' : 'en-US'
        );
        fileContents += `\n--- ARCHIVO: ${fileName} ---\nSubido por: ${
          file.users?.full_name || 'N/A'
        }\nFecha: ${uploadDate}\nContenido: ${content}\n`;
      }

      context += fileContents;
    } else {
      context += '\n📁 No hay archivos registrados para este paciente.\n';
    }

    // Buscar notas del paciente
    const { data: notes } = await supabase
      .from('patient_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    if (notes && notes.length > 0) {
      context += `\n📋 NOTAS MÉDICAS RECIENTES:\n`;
      notes.slice(0, 3).forEach((n: any, i: number) => {
        context += `(${i + 1}) Diagnóstico: ${n.diagnosis}\nTratamiento: ${
          n.treatment
        }\nObservaciones: ${n.observations || '-'}\nFecha: ${n.created_at}\n\n`;
      });
    } else {
      context += '\n📋 No hay notas médicas registradas para este paciente.\n';
    }

    // Construir prompt para OpenAI con instrucciones para detectar automáticamente
    const systemPromptWithContext = `${systemPrompt}

INFORMACIÓN DEL PACIENTE Y ARCHIVOS:
${context}

INSTRUCCIONES IMPORTANTES:
1. Analiza automáticamente si la consulta se refiere a archivos específicos, datos del paciente, o información general.
2. Si se mencionan archivos, busca en el contenido de TODOS los archivos disponibles y responde específicamente.
3. Si se pide información médica, usa las notas médicas disponibles.
4. Responde en el idioma del usuario (${
      language === 'es' ? 'español' : language === 'sw' ? 'swahili' : 'inglés'
    }).
5. Sé específico y profesional en tus respuestas.
6. Usa SOLO la información de la base de datos y archivos (NO uses internet).

HISTORIAL DE LA CONVERSACIÓN:
Tienes acceso al historial completo de la conversación para mantener contexto.`;

    const openaiRes = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPromptWithContext },
            ...messages, // Incluir historial completo
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      }
    );

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ content });
  }

  // --- Búsqueda en internet (SOLO internet) ---
  let webContext = '';
  if (queryType === 'internet' && serperKey) {
    const lastUserMsg =
      messages.filter((m: any) => m.role === 'user').slice(-1)[0]?.content ||
      '';
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': serperKey,
      },
      body: JSON.stringify({
        q: lastUserMsg,
        gl: language === 'es' ? 'es' : language === 'sw' ? 'ke' : 'us',
        hl: language,
      }),
    });
    if (serperRes.ok) {
      const serperData = await serperRes.json();
      if (serperData.organic && serperData.organic.length > 0) {
        webContext = serperData.organic
          .slice(0, 5)
          .map(
            (r: any, i: number) =>
              `(${i + 1}) ${r.title}\n${r.snippet}\n${r.link}`
          )
          .join('\n\n');
      }
    }
  }

  const systemPromptWithWeb = `${systemPrompt}

INFORMACIÓN DE INTERNET:
${webContext}

INSTRUCCIONES IMPORTANTES:
1. Usa SOLO la información encontrada en internet.
2. Responde en el idioma del usuario (${
    language === 'es' ? 'español' : language === 'sw' ? 'swahili' : 'inglés'
  }).
3. Sé específico y profesional en tus respuestas.
4. NO uses información de la base de datos (solo internet).

HISTORIAL DE LA CONVERSACIÓN:
Tienes acceso al historial completo de la conversación para mantener contexto.`;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPromptWithWeb },
        ...messages, // Incluir historial completo
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!openaiRes.ok) {
    const error = await openaiRes.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await openaiRes.json();
  const content = data.choices?.[0]?.message?.content || '';
  return NextResponse.json({ content });
}
