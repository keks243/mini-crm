# Мини-CRM «Объекты и задачи»

React + TypeScript + Vite + Mantine + Supabase.

## Запуск
1. Создайте проект Supabase и выполните SQL-миграции из `supabase/migrations` по порядку.
2. Скопируйте `.env.example` в `.env.local` и заполните `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (только anon-ключ!).
3. `npm install`
4. `npm run dev`

Секретный `service_role`-ключ во фронтенд и в репозиторий не добавляется.
