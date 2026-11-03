import { Link, Outlet, useLocation } from 'react-router-dom';
import { AppShell, Button, Container, Group, Text } from '@mantine/core';
import { useAuth } from '../auth/useAuth';
import { ROLE_LABELS } from '../lib/constants';

export function Layout() {
  const { profile, signOut } = useAuth();
  const { pathname } = useLocation();
  if (!profile) return null;

  const nav =
    profile.role === 'executor'
      ? [
          { to: '/my-tasks', label: 'Мои задачи' },
          { to: '/objects', label: 'Объекты' },
        ]
      : [{ to: '/objects', label: 'Объекты' }];

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header style={{ background: 'var(--mantine-color-dark-8)', border: 'none' }}>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Text c="white" fw={700}>
                Объекты и задачи
              </Text>
              <Group gap="xs" wrap="nowrap">
                {nav.map((item) => (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    size="compact-md"
                    color="orange"
                    variant={pathname.startsWith(item.to) ? 'filled' : 'subtle'}
                  >
                    {item.label}
                  </Button>
                ))}
              </Group>
            </Group>
            <Group gap="md" wrap="nowrap">
              <div>
                <Text c="white" size="sm" lh={1.2}>
                  {profile.full_name ?? profile.email}
                </Text>
                <Text c="dimmed" size="xs" lh={1.2}>
                  {ROLE_LABELS[profile.role]}
                </Text>
              </div>
              <Button size="compact-md" variant="outline" color="gray" onClick={() => void signOut()}>
                Выйти
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
