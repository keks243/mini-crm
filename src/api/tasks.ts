import { supabase } from './supabase';
import type { Task, TaskStatus } from '../types/domain';

// У tasks две связи с profiles (исполнитель и автор), поэтому имена связей указаны явно.
const TASK_SELECT = `
  *,
  object:objects(id, name, address),
  assignee:profiles!tasks_assignee_id_fkey(id, full_name),
  author:profiles!tasks_author_id_fkey(id, full_name)
`;

export interface TaskFilter {
  objectId?: string;
  assigneeId?: string;
}

export interface TaskInput {
  title: string;
  description: string | null;
  object_id: string;
  assignee_id: string;
}

export async function listTasks(filter: TaskFilter = {}): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select(TASK_SELECT)
    .order('created_at', { ascending: false });
  if (filter.objectId) query = query.eq('object_id', filter.objectId);
  if (filter.assigneeId) query = query.eq('assignee_id', filter.assigneeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Task[];
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Task | null;
}

export async function createTask(input: TaskInput, authorId: string): Promise<void> {
  // Статус не передаём: база сама ставит 'new', а RLS другого и не пропустит.
  const { error } = await supabase.from('tasks').insert({ ...input, author_id: authorId });
  if (error) throw error;
}

// Поле status здесь намеренно отсутствует: статус меняется только через changeTaskStatus.
export async function updateTask(id: string, input: TaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function changeTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  comment?: string,
): Promise<void> {
  const { error } = await supabase.rpc('change_task_status', {
    p_task_id: taskId,
    p_new_status: newStatus,
    p_comment: comment?.trim() || null,
  });
  if (error) throw error;
}
