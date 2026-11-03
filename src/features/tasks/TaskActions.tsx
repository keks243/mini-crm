import { useState } from 'react';
import { Button, Group, Modal, Stack, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { changeTaskStatus } from '../../api/tasks';
import { getErrorMessage } from '../../lib/errors';
import type { Transition } from '../../lib/transitions';

interface Props {
  taskId: string;
  transitions: Transition[];
  onChanged: () => void;
}

export function TaskActions({ taskId, transitions, onChanged }: Props) {
  const [pending, setPending] = useState(false);
  const [commentFor, setCommentFor] = useState<Transition | null>(null);
  const [comment, setComment] = useState('');

  if (transitions.length === 0) return null;

  async function run(t: Transition, text?: string) {
    setPending(true);
    try {
      await changeTaskStatus(taskId, t.to, text);
      notifications.show({ color: 'green', message: 'Статус изменён' });
      setCommentFor(null);
      setComment('');
      onChanged();
    } catch (e) {
      // Сообщение приходит из базы: например, «Переход из new в on_review запрещён»
      notifications.show({ color: 'red', title: 'Не удалось изменить статус', message: getErrorMessage(e) });
    } finally {
      setPending(false);
    }
  }

  function handleClick(t: Transition) {
    if (t.requiresComment) {
      setCommentFor(t);
    } else {
      void run(t);
    }
  }

  return (
    <>
      <Group>
        {transitions.map((t) => (
          <Button
            key={t.to}
            color={t.danger ? 'red' : 'orange'}
            variant={t.danger ? 'outline' : 'filled'}
            loading={pending && !commentFor}
            onClick={() => handleClick(t)}
          >
            {t.label}
          </Button>
        ))}
      </Group>

      <Modal
        opened={commentFor !== null}
        onClose={() => setCommentFor(null)}
        title={commentFor?.label}
      >
        <Stack>
          <Textarea
            label="Комментарий"
            description="Объясните исполнителю, что нужно исправить"
            required
            autosize
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCommentFor(null)}>
              Отмена
            </Button>
            <Button
              color="red"
              loading={pending}
              disabled={comment.trim() === ''}
              onClick={() => commentFor && void run(commentFor, comment)}
            >
              {commentFor?.label}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
