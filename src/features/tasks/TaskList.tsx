import { Link } from 'react-router-dom';
import { Anchor, Table, Text } from '@mantine/core';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../lib/format';
import type { Task } from '../../types/domain';

interface Props {
  tasks: Task[];
  showObject?: boolean;
  showAssignee?: boolean;
}

export function TaskList({ tasks, showObject = false, showAssignee = false }: Props) {
  if (tasks.length === 0) {
    return <Text c="dimmed">Задач пока нет.</Text>;
  }
  return (
    <Table.ScrollContainer minWidth={560}>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Задача</Table.Th>
            {showObject && <Table.Th>Объект</Table.Th>}
            {showAssignee && <Table.Th>Исполнитель</Table.Th>}
            <Table.Th>Статус</Table.Th>
            <Table.Th>Создана</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tasks.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td>
                <Anchor component={Link} to={`/tasks/${t.id}`} fw={500}>
                  {t.title}
                </Anchor>
              </Table.Td>
              {showObject && <Table.Td>{t.object?.name ?? '—'}</Table.Td>}
              {showAssignee && <Table.Td>{t.assignee?.full_name ?? '—'}</Table.Td>}
              <Table.Td>
                <StatusBadge status={t.status} />
              </Table.Td>
              <Table.Td>{formatDate(t.created_at)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
