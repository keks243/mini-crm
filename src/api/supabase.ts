import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error('Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (см. .env.example)');
}

// Во фронтенде используется ТОЛЬКО публичный anon-ключ.
// Секретный service_role-ключ сюда попадать не должен никогда.
export const supabase = createClient(url, anonKey);
