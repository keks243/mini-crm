import { Link } from 'react-router-dom';
import { Button, Container, Stack, Text, Title } from '@mantine/core';

export function NotFoundPage() {
  return (
    <Container size="xs" py={80}>
      <Stack align="flex-start">
        <Title order={2}>Страница не найдена</Title>
        <Text c="dimmed">Проверьте адрес или вернитесь на главную.</Text>
        <Button component={Link} to="/" color="orange">
          На главную
        </Button>
      </Stack>
    </Container>
  );
}
