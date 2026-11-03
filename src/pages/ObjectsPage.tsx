import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Button, Group, Table, Text, Title } from '@mantine/core';
import { listObjects } from '../api/objects';
import { useAuth } from '../auth/useAuth';
import { ErrorState } from '../components/ErrorState';
import { Loader } from '../components/Loader';
import { ObjectForm } from '../features/objects/ObjectForm';
import { useAsync } from '../hooks/useAsync';
import { formatDate } from '../lib/format';

export function ObjectsPage() {
  const { isManager } = useAuth();
  const objects = useAsync(listObjects, []);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Объекты</Title>
        {isManager && (
          <Button color="orange" onClick={() => setCreating(true)}>
            Новый объект
          </Button>
        )}
      </Group>

      {objects.loading && !objects.data && <Loader />}
      {objects.error && <ErrorState message={objects.error} />}
      {objects.data && objects.data.length === 0 && (
        <Text c="dimmed">
          {isManager ? 'Объектов пока нет. Создайте первый.' : 'У вас пока нет задач ни на одном объекте.'}
        </Text>
      )}
      {objects.data && objects.data.length > 0 && (
        <Table.ScrollContainer minWidth={480}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th>Адрес</Table.Th>
                <Table.Th>Создан</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {objects.data.map((o) => (
                <Table.Tr key={o.id}>
                  <Table.Td>
                    <Anchor component={Link} to={`/objects/${o.id}`} fw={500}>
                      {o.name}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{o.address ?? '—'}</Table.Td>
                  <Table.Td>{formatDate(o.created_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      {creating && <ObjectForm onClose={() => setCreating(false)} onSaved={objects.reload} />}
    </>
  );
}
