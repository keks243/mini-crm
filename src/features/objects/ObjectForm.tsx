import { useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createObject, updateObject } from '../../api/objects';
import { useAuth } from '../../auth/useAuth';
import { getErrorMessage } from '../../lib/errors';
import type { ObjectItem } from '../../types/domain';

interface Props {
  object?: ObjectItem; // если передан — редактирование, иначе создание
  onClose: () => void;
  onSaved: () => void;
}

/** Рендерите компонент только когда форма открыта: {open && <ObjectForm ... />} */
export function ObjectForm({ object, onClose, onSaved }: Props) {
  const { profile } = useAuth();
  const [name, setName] = useState(object?.name ?? '');
  const [address, setAddress] = useState(object?.address ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (name.trim() === '' || !profile) return;
    setSaving(true);
    try {
      const input = { name: name.trim(), address: address.trim() || null };
      if (object) await updateObject(object.id, input);
      else await createObject(input, profile.id);
      notifications.show({ color: 'green', message: object ? 'Объект сохранён' : 'Объект создан' });
      onSaved();
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось сохранить', message: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened onClose={onClose} title={object ? 'Редактировать объект' : 'Новый объект'}>
      <Stack>
        <TextInput
          label="Название"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          data-autofocus
        />
        <TextInput
          label="Адрес"
          value={address}
          onChange={(e) => setAddress(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button color="orange" loading={saving} disabled={name.trim() === ''} onClick={() => void handleSave()}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
