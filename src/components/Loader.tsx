import { Center, Loader as MantineLoader } from '@mantine/core';

export function Loader() {
  return (
    <Center py="xl">
      <MantineLoader color="orange" />
    </Center>
  );
}
