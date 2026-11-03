export type Role = 'manager' | 'executor';

export type TaskStatus = 'new' | 'in_progress' | 'on_review' | 'accepted' | 'rework';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
}

export interface PersonRef {
  id: string;
  full_name: string | null;
}

export interface ObjectItem {
  id: string;
  name: string;
  address: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  object_id: string;
  assignee_id: string | null;
  author_id: string | null;
  status: TaskStatus;
  created_at: string;
  // Связанные данные (приходят через join в api/tasks.ts)
  object: { id: string; name: string; address: string | null } | null;
  assignee: PersonRef | null;
  author: PersonRef | null;
}

export interface HistoryEntry {
  id: string;
  task_id: string;
  from_status: TaskStatus | null;
  to_status: TaskStatus;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
  author: PersonRef | null;
}
