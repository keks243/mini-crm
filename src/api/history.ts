import { supabase } from './supabase';
import type { HistoryEntry } from '../types/domain';

// История доступна только для чтения. Записывает её сама база.
export async function listHistory(taskId: string): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('task_history')
    .select('*, author:profiles!task_history_changed_by_fkey(id, full_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as HistoryEntry[];
}
