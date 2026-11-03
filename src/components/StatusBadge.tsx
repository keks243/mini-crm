import { Badge } from '@mantine/core';
import { STATUS_COLORS, STATUS_LABELS } from '../lib/constants';
import type { TaskStatus } from '../types/domain';

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge color={STATUS_COLORS[status]} variant="light">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
