import { Navigate, Outlet } from 'react-router-dom';
import { Button, Container, Stack } from '@mantine/core';
import { useAuth } from './useAuth';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';

/** Пускает дальше только вошедших пользователей с профилем. */
export function RequireAuth() {
  const { user, profile, loading, profileError, signOut } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) {
    return (
      <Container size="xs" py="xl">
        <Stack>
          <ErrorState message={profileError ?? 'Профиль не найден'} />
          <Button variant="default" onClick={() => void signOut()}>
            Выйти
          </Button>
        </Stack>
      </Container>
    );
  }
  return <Outlet />;
}
