import type { Role, TaskStatus } from '../types/domain';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  on_review: 'На проверке',
  accepted: 'Принята',
  rework: 'На доработке',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  new: 'gray',
  in_progress: 'blue',
  on_review: 'yellow',
  accepted: 'green',
  rework: 'red',
};

export const STATUS_ORDER: TaskStatus[] = ['new', 'in_progress', 'on_review', 'rework', 'accepted'];

export const ROLE_LABELS: Record<Role, string> = {
  manager: 'Постановщик',
  executor: 'Исполнитель',
};
