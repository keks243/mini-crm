import { supabase } from './supabase';
import type { ObjectItem } from '../types/domain';

export interface ObjectInput {
  name: string;
  address: string | null;
}

export async function listObjects(): Promise<ObjectItem[]> {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ObjectItem[];
}

export async function getObject(id: string): Promise<ObjectItem | null> {
  const { data, error } = await supabase.from('objects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as ObjectItem | null;
}

export async function createObject(input: ObjectInput, createdBy: string): Promise<void> {
  const { error } = await supabase.from('objects').insert({ ...input, created_by: createdBy });
  if (error) throw error;
}

export async function updateObject(id: string, input: ObjectInput): Promise<void> {
  const { error } = await supabase.from('objects').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteObject(id: string): Promise<void> {
  const { error } = await supabase.from('objects').delete().eq('id', id);
  if (error) throw error;
}
