import { useState, useRef, useEffect } from 'react';
import {
  X,
  Globe,
  Database,
  MessageSquarePlus,
  Trash2,
  Loader2,
  Menu,
  Edit2,
  Check,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, Patient, PatientNote, PatientFile } from '@/lib/supabase';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { useAuth } from '@/contexts/AuthContext';

interface ChatbotProps {
  onClose: () => void;
}

// Tipos para conversación
interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}
interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

// Mejorar extractor de referencia de paciente para frases naturales y nombres compuestos
function extractPatientReference(text: string): string | null {
  // Buscar patrones como "de Juan Pérez", "sobre Juan", "de la paciente Ana María", etc.
  const match = text.match(
    /(?:de|sobre|about|del|de la|del paciente|de la paciente|del paciente|paciente|patient|nombre|name)\s+([\wáéíóúüñÁÉÍÓÚÜÑ\s']+)/i
  );
  if (match) {
    return match[1].trim();
  }
  // Si no, buscar la última palabra relevante
  const fallback = text.match(/([A-Za-záéíóúüñÁÉÍÓÚÜÑ']{3,})$/);
  return fallback ? fallback[1] : null;
}

function extractFileReference(text: string): string | null {
  // Busca palabras clave de archivo (radiografía, pdf, docx, imagen, etc.)
  const match = text.match(
    /(radiografía|imagen|pdf|docx|txt|archivo|file|prueba|resultados|scan|xray|image|document)/i
  );
  return match ? match[1] : null;
}

export default function Chatbot({ onClose }: ChatbotProps) {
  const { t, language } = useI18n();
  const { appUser } = useAuth ? useAuth() : { appUser: null };
  const [queryType, setQueryType] = useState<'db' | 'internet'>('db');
  const [messages, setMessages] = useState<
    { role: 'user' | 'bot'; text: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const patientContext = useRef<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  // Estado para gestor de conversaciones
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [savingConv, setSavingConv] = useState(false);
  // Añadir estado para menú en móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  // Estado para edición de títulos
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Cargar conversaciones del usuario al abrir el chatbot
  useEffect(() => {
    if (!appUser) return;
    setLoadingConvs(true);
    supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setConversations(data || []);
        if (data && data.length > 0) {
          setActiveConvId(data[0].id);
          setMessages(
            data[0].messages || [{ role: 'bot', text: t('chatbot.welcome') }]
          );
        } else {
          setActiveConvId(null);
          setMessages([{ role: 'bot', text: t('chatbot.welcome') }]);
        }
      })
      .finally(() => setLoadingConvs(false));
  }, [appUser, language]);

  // Guardar conversación actual al cerrar
  const handleClose = async () => {
    if (appUser && activeConvId) {
      setSavingConv(true);
      await supabase
        .from('chatbot_conversations')
        .update({ messages })
        .eq('id', activeConvId);
      setSavingConv(false);
    }
    onClose();
  };

  // Crear nueva conversación
  const handleNewConversation = async () => {
    if (!appUser) return;
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert({
        user_id: appUser.id,
        title: t('chatbot.newConversationTitle', {
          date: new Date().toLocaleString(language),
        }),
        messages: [{ role: 'bot', text: t('chatbot.welcome') }],
      })
      .select()
      .single();
    if (!error && data) {
      setConversations([data, ...conversations]);
      setActiveConvId(data.id);
      setMessages(data.messages);
    }
  };

  // Seleccionar conversación
  const handleSelectConversation = (conv: ChatConversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
  };

  // Eliminar conversación
  const handleDeleteConversation = async (convId: string) => {
    await supabase.from('chatbot_conversations').delete().eq('id', convId);
    setConversations(conversations.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      if (conversations.length > 1) {
        const next = conversations.find(c => c.id !== convId);
        setActiveConvId(next?.id || null);
        setMessages(
          next?.messages || [{ role: 'bot', text: t('chatbot.welcome') }]
        );
      } else {
        setActiveConvId(null);
        setMessages([{ role: 'bot', text: t('chatbot.welcome') }]);
      }
    }
  };

  // Función para editar título de conversación
  const handleEditConversation = (conv: ChatConversation) => {
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  // Función para guardar título editado
  const handleSaveConversationTitle = async () => {
    if (!editingConvId || !editingTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ title: editingTitle.trim() })
        .eq('id', editingConvId);

      if (error) throw error;

      // Actualizar estado local
      setConversations(convs =>
        convs.map(conv =>
          conv.id === editingConvId
            ? { ...conv, title: editingTitle.trim() }
            : conv
        )
      );

      setEditingConvId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingConvId(null);
    setEditingTitle('');
  };

  const systemPrompt =
    language === 'es'
      ? 'Eres un asistente profesional. Responde de forma clara, resumida y esquemática. Usa listas y resalta lo importante. Responde siempre en español.'
      : language === 'sw'
      ? 'Wewe ni msaidizi wa kitaalamu. Jibu kwa ufupi, kwa mpangilio na kwa Kiswahili. Tumia orodha na uweke mambo muhimu wazi.'
      : 'You are a professional assistant. Answer clearly, concisely, and in a schematic way. Use lists and highlight key points. Always answer in English.';

  // 1. PDF.js: establecer workerSrc correctamente en el cliente
  async function extractTextFromPDF(blob: Blob): Promise<string> {
    if (typeof window === 'undefined')
      throw new Error('PDF extraction solo disponible en el cliente');
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${
        pdfjsLib.version || '4.2.67'
      }/pdf.worker.min.js`;
    }
    const arrayBuffer = await blob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  }

  async function extractTextFromDOCX(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  async function extractTextFromImage(blob: Blob): Promise<string> {
    const image = URL.createObjectURL(blob);
    // Tesseract soporta jpg, jpeg, png, bmp, gif, tiff
    const { data } = await Tesseract.recognize(
      image,
      language === 'es' ? 'spa' : language === 'sw' ? 'swa' : 'eng'
    );
    URL.revokeObjectURL(image);
    return data.text;
  }

  // Enviar queryType explícitamente al backend
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setError('');
    setLoading(true);
    setMessages(msgs => [...msgs, { role: 'user', text: input }]);
    setInput('');

    try {
      const res = await fetch('/api/chatbot-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: input },
          ],
          language,
          systemPrompt,
          queryType, // Enviar tipo de consulta
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMessages(msgs => [...msgs, { role: 'bot', text: data.content }]);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-end pointer-events-none'>
      <div className='flex w-full max-w-4xl h-[80vh] md:h-[80vh] pointer-events-auto rounded-2xl shadow-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden'>
        {/* Menú de conversaciones (columna izquierda en desktop, overlay en móvil) */}
        {/* Escritorio: menú fijo a la izquierda del chatbot */}
        <div
          className={`hidden md:flex flex-col bg-gray-50 border-r w-64 h-full p-4 overflow-y-auto`}
        >
          <div className='flex items-center justify-between mb-2'>
            <span className='font-semibold text-xs md:text-base'>
              {t('chatbot.conversations')}
            </span>
            <button
              onClick={handleNewConversation}
              className='text-blue-600 hover:text-blue-800'
            >
              <MessageSquarePlus className='h-5 w-5' />
            </button>
          </div>
          {loadingConvs ? (
            <div className='flex justify-center items-center h-12'>
              <Loader2 className='animate-spin h-5 w-5' />
            </div>
          ) : (
            <ul className='space-y-2'>
              {conversations.map(conv => (
                <li
                  key={conv.id}
                  className={`group flex items-center justify-between rounded-lg px-2 py-1 cursor-pointer transition-colors ${
                    activeConvId === conv.id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  {editingConvId === conv.id ? (
                    <div className='flex-1 flex items-center space-x-1'>
                      <input
                        type='text'
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        className='flex-1 text-xs md:text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleSaveConversationTitle();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSaveConversationTitle();
                        }}
                        className='text-green-600 hover:text-green-800'
                      >
                        <Check className='h-3 w-3' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className='text-gray-400 hover:text-gray-600'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className='truncate text-xs md:text-sm flex-1'>
                        {conv.title}
                      </span>
                      <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEditConversation(conv);
                          }}
                          className='text-blue-400 hover:text-blue-600'
                        >
                          <Edit2 className='h-3 w-3' />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className='text-red-400 hover:text-red-600'
                        >
                          <Trash2 className='h-3 w-3' />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contenedor principal del chatbot */}
        <div className='flex-1 flex flex-col h-full relative'>
          {/* Header moderno */}
          <div className='flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-white rounded-t-2xl md:rounded-tl-none'>
            <div className='flex items-center space-x-2'>
              <span className='font-bold text-xl text-blue-700'>Chatbot</span>
              <span className='text-xs text-gray-400'>
                ({language.toUpperCase()})
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              {/* Botón de menú para móvil */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className='md:hidden bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors'
              >
                <Menu className='h-5 w-5' />
              </button>
              <button
                onClick={handleClose}
                className='text-gray-400 hover:text-blue-600 transition-colors'
              >
                {savingConv ? (
                  <Loader2 className='animate-spin h-6 w-6' />
                ) : (
                  <X className='h-6 w-6' />
                )}
              </button>
            </div>
          </div>

          {/* Selector de tipo de consulta */}
          <div className='flex items-center justify-center space-x-2 p-3 bg-gray-50 border-b'>
            <button
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                queryType === 'db'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setQueryType('db')}
            >
              <Database className='h-4 w-4' />
              <span>{t('chatbot.database')}</span>
            </button>
            <button
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                queryType === 'internet'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setQueryType('internet')}
            >
              <Globe className='h-4 w-4' />
              <span>{t('chatbot.internet')}</span>
            </button>
          </div>

          {/* Mensajes */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.length === 0 && (
              <div className='text-gray-400 text-center mt-8'>
                {t('chatbot.welcome')}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3 max-w-lg shadow ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='rounded-2xl px-5 py-3 max-w-lg bg-gray-100 text-gray-400 shadow'>
                  ...
                </div>
              </div>
            )}
            {error && (
              <div className='text-red-600 text-sm text-center mt-2'>
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className='p-4 border-t flex items-center space-x-2 bg-white rounded-b-2xl'
            onSubmit={handleSend}
          >
            <input
              type='text'
              className='flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base'
              placeholder={t('chatbot.inputPlaceholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type='submit'
              className='bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50'
              disabled={loading || !input.trim()}
            >
              {t('chatbot.send')}
            </button>
          </form>
        </div>

        {/* Menú móvil overlay */}
        {mobileMenuOpen && (
          <div
            className='absolute inset-0 z-50 flex items-center justify-center p-4'
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className='bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden'
              onClick={e => e.stopPropagation()}
            >
              {/* Header del menú móvil */}
              <div className='flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-white'>
                <div className='flex items-center space-x-2'>
                  <span className='font-bold text-lg text-blue-700'>
                    {t('chatbot.conversations')}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              {/* Contenido del menú móvil */}
              <div className='p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-sm font-medium text-gray-700'>
                    {t('chatbot.conversations')}
                  </span>
                  <button
                    onClick={handleNewConversation}
                    className='text-blue-600 hover:text-blue-800'
                  >
                    <MessageSquarePlus className='h-5 w-5' />
                  </button>
                </div>

                {loadingConvs ? (
                  <div className='flex justify-center items-center h-12'>
                    <Loader2 className='animate-spin h-5 w-5' />
                  </div>
                ) : (
                  <ul className='space-y-2 max-h-60 overflow-y-auto'>
                    {conversations.map(conv => (
                      <li
                        key={conv.id}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                          activeConvId === conv.id
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          handleSelectConversation(conv);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {editingConvId === conv.id ? (
                          <div className='flex-1 flex items-center space-x-1'>
                            <input
                              type='text'
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              className='flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500'
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleSaveConversationTitle();
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleSaveConversationTitle();
                              }}
                              className='text-green-600 hover:text-green-800'
                            >
                              <Check className='h-4 w-4' />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className='text-gray-400 hover:text-gray-600'
                            >
                              <X className='h-4 w-4' />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className='truncate text-sm flex-1'>
                              {conv.title}
                            </span>
                            <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2'>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEditConversation(conv);
                                }}
                                className='text-blue-400 hover:text-blue-600'
                              >
                                <Edit2 className='h-4 w-4' />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conv.id);
                                }}
                                className='text-red-400 hover:text-red-600'
                              >
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
