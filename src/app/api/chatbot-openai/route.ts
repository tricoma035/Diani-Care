import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Interfaces para tipado
interface ChatMessage {
  role: string;
  content: string;
}

interface Patient {
  id: string;
  full_name: string;
  identity_number: string;
  age: number;
  sex: string;
  hospital: string;
}

interface PatientNote {
  diagnosis: string;
  treatment: string;
  observations?: string;
  created_at: string;
}

interface WebSearchResult {
  title: string;
  snippet: string;
  link: string;
}

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
  if (match) {
    return match[1].trim();
  }
  const fallback = text.match(/([A-Za-záéíóúüñÁÉÍÓÚÜÑ']{3,})$/);
  return fallback ? fallback[1] : null;
}

// Extraer texto de diferentes tipos de archivos
async function extractTextFromFile(
  fileUrl: string,
  fileName: string
): Promise<string> {
  try {
    // Extraer la ruta del archivo del URL completo
    const filePath = fileUrl.replace(
      '/storage/v1/object/public/patient-files/',
      ''
    );

    // Descargar el archivo desde Supabase Storage
    const { data, error } = await supabase.storage
      .from('patient-files')
      .download(filePath);

    if (error) {
      return `Error al leer el archivo: ${fileName} - ${error.message}`;
    }

    if (!data) {
      return `Error al leer el archivo: ${fileName} - Archivo vacío`;
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Convertir a texto según el tipo de archivo
    if (fileExtension === 'txt') {
      // Buscar contenido ya extraído en la base de datos
      const { data: existingContent } = await supabase
        .from('file_contents')
        .select('content')
        .eq('file_path', fileUrl)
        .single();

      if (existingContent?.content) {
        return `CONTENIDO DEL ARCHIVO DE TEXTO "${fileName}":\n\n${existingContent.content}`;
      } else {
        const text = await data.text();
        return text;
      }
    } else if (fileExtension === 'pdf') {
      try {
        const arrayBuffer = await data.arrayBuffer();

        // Buscar contenido ya extraído en la base de datos
        const { data: existingContent } = await supabase
          .from('file_contents')
          .select('content')
          .eq('file_path', fileUrl)
          .single();

        if (existingContent?.content) {
          return `CONTENIDO DEL PDF "${fileName}":\n\n${existingContent.content.substring(
            0,
            1000
          )}${existingContent.content.length > 1000 ? '...' : ''}`;
        } else {
          return `PDF "${fileName}" - Tamaño: ${Math.ceil(
            arrayBuffer.byteLength / 1000
          )}KB - Estado: Archivo PDF disponible para análisis. El contenido del PDF está disponible para revisión manual.`;
        }
      } catch (pdfError) {
        return `Error procesando PDF ${fileName}: ${pdfError}`;
      }
    } else if (
      ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension || '')
    ) {
      try {
        const arrayBuffer = await data.arrayBuffer();

        // Por ahora, devolvemos información básica de la imagen
        // En producción se implementaría con una librería compatible con Next.js
        return `IMAGEN "${fileName}" - Tamaño: ${Math.ceil(
          arrayBuffer.byteLength / 1000
        )}KB - Estado: Archivo de imagen disponible para análisis. El contenido de la imagen está disponible para revisión manual.`;
      } catch (imgError) {
        return `Error procesando imagen ${fileName}: ${imgError}`;
      }
    } else if (fileExtension === 'docx') {
      try {
        const arrayBuffer = await data.arrayBuffer();

        // Buscar contenido ya extraído en la base de datos
        const { data: existingContent } = await supabase
          .from('file_contents')
          .select('content')
          .eq('file_path', fileUrl)
          .single();

        if (existingContent?.content) {
          return `CONTENIDO DEL DOCX "${fileName}":\n\n${existingContent.content.substring(
            0,
            1000
          )}${existingContent.content.length > 1000 ? '...' : ''}`;
        } else {
          return `DOCX "${fileName}" - Tamaño: ${Math.ceil(
            arrayBuffer.byteLength / 1000
          )}KB - Estado: Archivo DOCX disponible para análisis. El contenido del DOCX está disponible para revisión manual.`;
        }
      } catch (docxError) {
        return `Error procesando DOCX ${fileName}: ${docxError}`;
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

  const model = 'gpt-4o-mini';

  // --- Búsqueda en base de datos (SOLO base de datos y archivos) ---
  if (queryType === 'db') {
    const lastUserMsg =
      messages.filter((m: ChatMessage) => m.role === 'user').slice(-1)[0]
        ?.content || '';
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
          .map((p: Patient) => `• ${p.full_name} (${p.identity_number})`)
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
      for (const file of files) {
        const fileName = file.file_url.split('/').pop() || 'archivo';

        // Primero buscar si ya tenemos el contenido extraído en la base de datos
        const { data: existingContent } = await supabase
          .from('file_contents')
          .select('content')
          .eq('file_path', file.file_url)
          .single();

        let content: string;
        if (existingContent?.content) {
          content = `CONTENIDO DEL ARCHIVO "${fileName}":\n\n${existingContent.content.substring(
            0,
            1000
          )}${existingContent.content.length > 1000 ? '...' : ''}`;
        } else {
          content = await extractTextFromFile(file.file_url, fileName);

          // Si se extrajo contenido real, actualizar el patient_id
          if (content.startsWith('CONTENIDO DEL')) {
            await supabase
              .from('file_contents')
              .update({ patient_id: patient.id })
              .eq('file_path', file.file_url);
          }
        }

        const uploadDate = new Date(file.uploaded_at).toLocaleDateString(
          language === 'es' ? 'es-ES' : language === 'sw' ? 'sw-KE' : 'en-US'
        );
        fileContents += `\n📄 ARCHIVO: ${fileName}\n👤 Subido por: ${
          file.users?.full_name || 'N/A'
        }\n📅 Fecha: ${uploadDate}\n📋 CONTENIDO:\n${content}\n`;
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
      notes.slice(0, 3).forEach((n: PatientNote, i: number) => {
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

INSTRUCCIONES CRÍTICAS:
1. TIENES INFORMACIÓN DEL PACIENTE Y EL CONTENIDO REAL DE SUS ARCHIVOS EN LA BASE DE DATOS. ÚSALA PARA RESPONDER.
2. Si te piden datos del paciente, usa la información de de las tablas.
3. Si te piden resumen de archivos, usa la información de archivos que tienes en las tablas.
4. Si te piden información médica del paciente, usa las notas médicas disponibles.
5. IMPORTANTE: Puedes LEER el contenido real de los archivos (PDFs, DOCX, imágenes) desde las tablas
6. Si hay "CONTENIDO DEL ARCHIVO" o "CONTENIDO DEL PDF", puedes analizar y responder preguntas sobre ese contenido.
7. EJEMPLO: Si te piden "¿Qué dice el PDF?" y tienes el contenido del PDF, analízalo y responde.
8. EJEMPLO: Si te piden "resumen de archivos", cuenta cuántos hay, qué tipos son, sus tamaños y haz un resumen real y detallado de ellos o del específico que te hayan pedido.
9. Responde en el idioma del usuario (${
      language === 'es' ? 'español' : language === 'sw' ? 'swahili' : 'inglés'
    }).
10. Sé específico y directo con la información que tienes.
11. Usa SOLO la información de la base de datos y archivos (NO uses internet).
12. NO digas que no puedes acceder a los archivos - usa la información que tienes disponible.
13. Si hay contenido de archivos disponible, úsalo para responder las preguntas sobre ellos.

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
      messages.filter((m: ChatMessage) => m.role === 'user').slice(-1)[0]
        ?.content || '';

    try {
      // Realizar 3 búsquedas diferentes para mayor veracidad
      const searchQueries = [
        lastUserMsg,
        `${lastUserMsg} fecha actual`,
        `${lastUserMsg} información actualizada`,
      ];

      const allResults: WebSearchResult[] = [];

      for (let i = 0; i < searchQueries.length; i++) {
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': serperKey,
          },
          body: JSON.stringify({
            q: searchQueries[i],
            gl: language === 'es' ? 'es' : language === 'sw' ? 'ke' : 'us',
            hl: language,
            num: 5, // 5 resultados por búsqueda
          }),
        });

        if (serperRes.ok) {
          const serperData = await serperRes.json();

          if (serperData.organic && serperData.organic.length > 0) {
            allResults.push(...serperData.organic);
          }
        }

        // Pequeña pausa entre búsquedas
        if (i < searchQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Eliminar duplicados basados en URL
      const uniqueResults = allResults.filter(
        (result, index, self) =>
          index === self.findIndex(r => r.link === result.link)
      );

      if (uniqueResults.length > 0) {
        webContext = uniqueResults
          .slice(0, 10)
          .map(
            (r: WebSearchResult, i: number) =>
              `(${i + 1}) ${r.title}\n${r.snippet}\n${r.link}`
          )
          .join('\n\n');
      } else {
      }
    } catch {
      // Error al procesar búsqueda web
    }
  }

  const systemPromptWithWeb = `${systemPrompt}

INFORMACIÓN DE INTERNET (RESULTADOS DE BÚSQUEDA ACTUALES - MÚLTIPLES FUENTES):
${webContext}

INSTRUCCIONES CRÍTICAS:
1. TIENES INFORMACIÓN ACTUALIZADA DE INTERNET GRACIAS A SERPER. ÚSALA PARA RESPONDER.
2. NO digas que no tienes acceso en tiempo real, porque no es verdad.
3. Si te preguntan por fecha/hora actual, usa la información de internet que tienes
4. IMPORTANTE: Usa la información de internet que tienes disponible para responder preguntas.
5. COMPARA la información de múltiples fuentes para dar la respuesta más veraz.
6. Responde en el idioma del usuario (${
    language === 'es' ? 'español' : language === 'sw' ? 'swahili' : 'inglés'
  }).
7. Sé específico y directo con la información que tienes.
8. NO uses información de la base de datos (solo internet).

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
