import { useState } from 'react';
import { Group, Select, Title } from '@mantine/core';
import { listTasks } from '../api/tasks';
import { useAuth } from '../auth/useAuth';
import { ErrorState } from '../components/ErrorState';
import { Loader } from '../components/Loader';
import { TaskList } from '../features/tasks/TaskList';
import { useAsync } from '../hooks/useAsync';
import { STATUS_LABELS, STATUS_ORDER } from '../lib/constants';

export function MyTasksPage() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const tasks = useAsync(() => listTasks({ assigneeId: profile?.id }), [profile?.id]);

  const visible = (tasks.data ?? []).filter((t) => !status || t.status === status);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Мои задачи</Title>
        <Select
          placeholder="Все статусы"
          clearable
          data={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          value={status}
          onChange={setStatus}
          w={200}
        />
      </Group>
      {tasks.loading && !tasks.data && <Loader />}
      {tasks.error && <ErrorState message={tasks.error} />}
      {tasks.data && <TaskList tasks={visible} showObject />}
    </>
  );
}
