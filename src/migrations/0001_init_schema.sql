-- 1. Профили (связь с auth.users, здесь храним роль)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null check (role in ('manager', 'executor')),
  created_at timestamptz default now()
);

-- 2. Объекты (стройки)
create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 3. Задачи
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  object_id uuid references public.objects(id) on delete cascade,
  assignee_id uuid references public.profiles(id),
  author_id uuid references public.profiles(id),
  status text not null default 'new' check (status in ('new', 'in_progress', 'on_review', 'accepted', 'rework')),
  created_at timestamptz default now()
);

-- 4. История статусов (append-only)
create table public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id),
  comment text,
  created_at timestamptz default now()
);

-- Индексы для скорости
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_object on public.tasks(object_id);
create index idx_history_task on public.task_history(task_id);