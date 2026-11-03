import type { Role, TaskStatus } from '../types/domain';

export interface Transition {
  to: TaskStatus;
  label: string;
  requiresComment?: boolean;
  danger?: boolean;
}

/**
 * Какие кнопки показать в карточке задачи.
 * Это ТОЛЬКО подсказка для интерфейса: настоящую проверку делает
 * функция change_task_status в базе данных.
 */
export function getAvailableTransitions(
  role: Role,
  status: TaskStatus,
  isAssignee: boolean,
): Transition[] {
  if (role === 'executor') {
    if (!isAssignee) return [];
    if (status === 'new' || status === 'rework') {
      return [{ to: 'in_progress', label: 'Взять в работу' }];
    }
    if (status === 'in_progress') {
      return [{ to: 'on_review', label: 'Отправить на проверку' }];
    }
    return [];
  }

  if (status === 'on_review') {
    return [
      { to: 'accepted', label: 'Принять' },
      { to: 'rework', label: 'Вернуть на доработку', requiresComment: true, danger: true },
    ];
  }
  return [];
}
