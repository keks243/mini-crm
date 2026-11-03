import { useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { listObjects } from '../../api/objects';
import { listExecutors } from '../../api/profiles';
import { createTask, updateTask } from '../../api/tasks';
import { useAuth } from '../../auth/useAuth';
import { useAsync } from '../../hooks/useAsync';
import { getErrorMessage } from '../../lib/errors';
import type { Task } from '../../types/domain';

interface Props {
  task?: Task; // если передана — редактирование, иначе создание
  defaultObjectId?: string;
  onClose: () => void;
  onSaved: () => void;
}

/** Рендерите компонент только когда форма открыта: {open && <TaskForm ... />} */
export function TaskForm({ task, defaultObjectId, onClose, onSaved }: Props) {
  const { profile } = useAuth();
  const options = useAsync(() => Promise.all([listObjects(), listExecutors()]), []);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [objectId, setObjectId] = useState<string | null>(task?.object_id ?? defaultObjectId ?? null);
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assignee_id ?? null);
  const [saving, setSaving] = useState(false);

  const [objects, executors] = options.data ?? [[], []];
  const canSave = title.trim() !== '' && objectId !== null && assigneeId !== null;

  async function handleSave() {
    if (!canSave || !profile) return;
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || null,
        object_id: objectId,
        assignee_id: assigneeId,
      };
      if (task) await updateTask(task.id, input);
      else await createTask(input, profile.id);
      notifications.show({ color: 'green', message: task ? 'Задача сохранена' : 'Задача создана' });
      onSaved();
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось сохранить', message: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened onClose={onClose} title={task ? 'Редактировать задачу' : 'Новая задача'}>
      <Stack>
        {options.error && <Alert color="red">{options.error}</Alert>}
        <TextInput
          label="Название"
          required
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          data-autofocus
        />
        <Textarea
          label="Описание"
          autosize
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <Select
          label="Объект"
          required
          searchable
          placeholder="Выберите объект"
          data={objects.map((o) => ({ value: o.id, label: o.name }))}
          value={objectId}
          onChange={setObjectId}
          disabled={options.loading}
        />
        <Select
          label="Исполнитель"
          required
          searchable
          placeholder="Выберите исполнителя"
          data={executors.map((p) => ({ value: p.id, label: p.full_name ?? p.email ?? p.id }))}
          value={assigneeId}
          onChange={setAssigneeId}
          disabled={options.loading}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button color="orange" loading={saving} disabled={!canSave} onClick={() => void handleSave()}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
