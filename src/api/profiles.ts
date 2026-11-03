import { supabase } from './supabase';
import type { Profile } from '../types/domain';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function listExecutors(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('role', 'executor')
    .order('full_name');
  if (error) throw error;
  return (data ?? []) as Profile[];
}
