import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Anchor, Button, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { deleteObject, getObject } from '../api/objects';
import { listTasks } from '../api/tasks';
import { useAuth } from '../auth/useAuth';
import { ErrorState } from '../components/ErrorState';
import { Loader } from '../components/Loader';
import { ObjectForm } from '../features/objects/ObjectForm';
import { TaskForm } from '../features/tasks/TaskForm';
import { TaskList } from '../features/tasks/TaskList';
import { useAsync } from '../hooks/useAsync';
import { getErrorMessage } from '../lib/errors';

export function ObjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const object = useAsync(() => getObject(id), [id]);
  const tasks = useAsync(() => listTasks({ objectId: id }), [id]);
  const [editing, setEditing] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  if (object.loading && !object.data) return <Loader />;
  if (object.error) return <ErrorState message={object.error} />;
  if (!object.data) {
    return <ErrorState message="Объект не найден или у вас нет к нему доступа." />;
  }
  const obj = object.data;

  async function handleDelete() {
    if (!window.confirm(`Удалить объект «${obj.name}» вместе со всеми его задачами и их историей?`)) return;
    try {
      await deleteObject(obj.id);
      notifications.show({ color: 'green', message: 'Объект удалён' });
      navigate('/objects');
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось удалить', message: getErrorMessage(e) });
    }
  }

  return (
    <Stack gap="lg">
      <div>
        <Anchor component={Link} to="/objects" size="sm">
          Все объекты
        </Anchor>
        <Group justify="space-between" mt="xs" align="flex-start">
          <div>
            <Title order={2}>{obj.name}</Title>
            <Text c="dimmed">{obj.address ?? 'Адрес не указан'}</Text>
          </div>
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

      <div>
        <Group justify="space-between" mb="sm">
          <Title order={3}>Задачи</Title>
          {isManager && (
            <Button color="orange" onClick={() => setAddingTask(true)}>
              Новая задача
            </Button>
          )}
        </Group>
        {tasks.loading && !tasks.data && <Loader />}
        {tasks.error && <ErrorState message={tasks.error} />}
        {tasks.data && <TaskList tasks={tasks.data} showAssignee />}
      </div>

      {editing && <ObjectForm object={obj} onClose={() => setEditing(false)} onSaved={object.reload} />}
      {addingTask && (
        <TaskForm defaultObjectId={obj.id} onClose={() => setAddingTask(false)} onSaved={tasks.reload} />
      )}
    </Stack>
  );
}
