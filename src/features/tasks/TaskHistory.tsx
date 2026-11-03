import { Text, Timeline } from '@mantine/core';
import { STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/format';
import type { HistoryEntry } from '../../types/domain';

export function TaskHistory({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return <Text c="dimmed">История пуста.</Text>;
  }
  return (
    <Timeline active={entries.length - 1} bulletSize={14} lineWidth={2} color="orange">
      {entries.map((e) => (
        <Timeline.Item
          key={e.id}
          title={
            e.from_status
              ? `${STATUS_LABELS[e.from_status]} → ${STATUS_LABELS[e.to_status]}`
              : 'Задача создана'
          }
        >
          <Text size="sm" c="dimmed">
            {e.author?.full_name ?? 'Неизвестный пользователь'}, {formatDate(e.created_at)}
          </Text>
          {e.from_status && e.comment && (
            <Text size="sm" mt={4}>
              {e.comment}
            </Text>
          )}
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
