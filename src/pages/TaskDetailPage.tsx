import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Anchor, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { listHistory } from '../api/history';
import { deleteTask, getTask } from '../api/tasks';
import { useAuth } from '../auth/useAuth';
import { ErrorState } from '../components/ErrorState';
import { Loader } from '../components/Loader';
import { StatusBadge } from '../components/StatusBadge';
import { TaskActions } from '../features/tasks/TaskActions';
import { TaskForm } from '../features/tasks/TaskForm';
import { TaskHistory } from '../features/tasks/TaskHistory';
import { useAsync } from '../hooks/useAsync';
import { getErrorMessage } from '../lib/errors';
import { formatDate } from '../lib/format';
import { getAvailableTransitions } from '../lib/transitions';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text>{children}</Text>
    </div>
  );
}

export function TaskDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isManager } = useAuth();
  const task = useAsync(() => getTask(id), [id]);
  const history = useAsync(() => listHistory(id), [id]);
  const [editing, setEditing] = useState(false);

  if (task.loading && !task.data) return <Loader />;
  if (task.error) return <ErrorState message={task.error} />;
  if (!task.data || !profile) {
    return <ErrorState message="Задача не найдена или у вас нет к ней доступа." />;
  }
  const t = task.data;

  const transitions = getAvailableTransitions(profile.role, t.status, t.assignee_id === profile.id);

  function reloadAll() {
    task.reload();
    history.reload();
  }

  async function handleDelete() {
    if (!window.confirm(`Удалить задачу «${t.title}» вместе с её историей?`)) return;
    try {
      await deleteTask(t.id);
      notifications.show({ color: 'green', message: 'Задача удалена' });
      navigate(`/objects/${t.object_id}`);
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось удалить', message: getErrorMessage(e) });
    }
  }

  return (
    <Stack gap="lg">
      <div>
        <Anchor component={Link} to={`/objects/${t.object_id}`} size="sm">
          {t.object?.name ?? 'Объект'}
        </Anchor>
        <Group justify="space-between" mt="xs" align="flex-start">
          <Group>
            <Title order={2}>{t.title}</Title>
            <StatusBadge status={t.status} />
          </Group>
          {isManager && (
            <Group>
              <Button variant="default" onClick={() => setEditing(true)}>
                Редактировать
              </Button>
              <Button variant="outline" color="red" onClick={() => void handleDelete()}>
                Удалить
              </Button>
            </Group>
          )}
        </Group>
      </div>

      <Paper withBorder p="md">
        <Stack>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Field label="Объект">{t.object?.name ?? '—'}</Field>
            <Field label="Адрес">{t.object?.address ?? '—'}</Field>
            <Field label="Исполнитель">{t.assignee?.full_name ?? '—'}</Field>
            <Field label="Автор">{t.author?.full_name ?? '—'}</Field>
            <Field label="Создана">{formatDate(t.created_at)}</Field>
          </SimpleGrid>
          <Field label="Описание">{t.description || 'Описание не заполнено'}</Field>
        </Stack>
      </Paper>

      {transitions.length > 0 && (
        <TaskActions taskId={t.id} transitions={transitions} onChanged={reloadAll} />
      )}

      <div>
        <Title order={3} mb="sm">
          История
        </Title>
        {history.loading && !history.data && <Loader />}
        {history.error && <ErrorState message={history.error} />}
        {history.data && <TaskHistory entries={history.data} />}
      </div>

      {editing && <TaskForm task={t} onClose={() => setEditing(false)} onSaved={reloadAll} />}
    </Stack>
  );
}
