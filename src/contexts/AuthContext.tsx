'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User as AppUser } from '@/lib/supabase';

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    identityNumber: string,
    hospital:
      | 'Diani Beach Hospital (Ukunda)'
      | 'Palm Beach Hospital (Ukunda)'
      | 'Diani Health Center (Ukunda)'
      | 'Pendo Duruma Medical Centre (Kwale County)'
      | 'Ukunda Medical Clinic (Ukunda)'
      | 'Sunshine Medical Clinic (Kwale County)',
    jobPosition: 'Director' | 'Médico' | 'Asistente'
  ) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: unknown }>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos del usuario de la aplicación
  const fetchAppUser = useCallback(async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching app user:', userError);
        // Si no existe el perfil, intentar crearlo con datos por defecto
        if (userError.code === 'PGRST116') {
          console.log(
            'Perfil de usuario no encontrado, creando perfil por defecto...'
          );
          try {
            const { data: authUser } = await supabase.auth.getUser();
            if (authUser.user) {
              await supabase.from('users').insert([
                {
                  id: userId,
                  email: authUser.user.email,
                  full_name: 'Usuario',
                  identity_number: 'N/A',
                  hospital: 'Diani Beach Hospital (Ukunda)',
                  job_position: 'Asistente',
                },
              ]);
              // Intentar obtener el perfil nuevamente
              const { data: newUserData } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
              if (newUserData) {
                setAppUser(newUserData);
              }
            }
          } catch (createError) {
            console.error('Error creating default profile:', createError);
          }
        }
        return;
      }

      setAppUser(userData);
    } catch (error) {
      console.error('Error fetching app user:', error);
    }
  }, []);

  // Función de inicio de sesión
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Intentando iniciar sesión con:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error en signIn:', error);
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        await fetchAppUser(data.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Error en signIn:', error);
      return { error };
    }
  };

  // Función de registro
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    identityNumber: string,
    hospital:
      | 'Diani Beach Hospital (Ukunda)'
      | 'Palm Beach Hospital (Ukunda)'
      | 'Diani Health Center (Ukunda)'
      | 'Pendo Duruma Medical Centre (Kwale County)'
      | 'Ukunda Medical Clinic (Ukunda)'
      | 'Sunshine Medical Clinic (Kwale County)',
    jobPosition: 'Director' | 'Médico' | 'Asistente'
  ) => {
    try {
      console.log('Intentando registrar usuario:', {
        email,
        fullName,
        identityNumber,
        hospital,
        jobPosition,
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            identity_number: identityNumber,
            hospital: hospital,
            job_position: jobPosition,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error en signUp:', error);
        return { error };
      }

      console.log('Usuario registrado exitosamente:', data);

      // Si el usuario no necesita confirmación de email, crear el perfil manualmente
      if (data.user && !data.user.email_confirmed_at) {
        try {
          await supabase.from('users').insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              identity_number: identityNumber,
              hospital: hospital,
              job_position: jobPosition,
            },
          ]);
        } catch (profileError) {
          console.error('Error creando perfil:', profileError);
          // No fallar el registro si el perfil no se puede crear
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error en signUp:', error);
      return { error };
    }
  };

  // Función de cierre de sesión
  const signOut = async () => {
    console.log('Cerrando sesión');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppUser(null);

      // Limpiar cualquier estado local persistente
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (newPassword: string) => {
    try {
      if (!user) {
        return { error: { message: 'Usuario no autenticado' } };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      // Actualizar el estado local si es necesario
      if (appUser) {
        setAppUser({
          ...appUser,
          must_change_password: false,
        });
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Verificar sesión al cargar
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          setUser(session.user);
          await fetchAppUser(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchAppUser(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAppUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
        await fetchAppUser(session.user.id);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAppUser]);

  const value = {
    user,
    appUser,
    loading,
    signIn,
    signUp,
    signOut,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
