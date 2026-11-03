-- Включаем RLS на всех таблицах
alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_history enable row level security;

-- Сначала отзываем все права у anon и authenticated
revoke all on public.profiles from anon, authenticated;
revoke all on public.objects from anon, authenticated;
revoke all on public.tasks from anon, authenticated;
revoke all on public.task_history from anon, authenticated;

-- Выдаём права только authenticated
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.objects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select on public.task_history to authenticated;
-- На task_history НЕТ update и delete, и INSERT тоже отозван (пишет только функция)

-- Функция проверки роли (security definer, чтобы избежать рекурсии)
create or replace function public.is_manager()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'manager');
$$;
revoke execute on function public.is_manager() from public, anon;
grant execute on function public.is_manager() to authenticated;

-- ========== ПОЛИТИКИ ДЛЯ profiles ==========
create policy "profiles_select_own_or_manager"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_manager());

-- ========== ПОЛИТИКИ ДЛЯ objects ==========
create policy "objects_select_manager_or_assigned"
  on public.objects for select to authenticated
  using (
    public.is_manager()
    or exists (select 1 from public.tasks where object_id = objects.id and assignee_id = (select auth.uid()))
  );

create policy "objects_insert_manager"
  on public.objects for insert to authenticated
  with check (public.is_manager());

create policy "objects_update_manager"
  on public.objects for update to authenticated
  using (public.is_manager());

create policy "objects_delete_manager"
  on public.objects for delete to authenticated
  using (public.is_manager());

-- ========== ПОЛИТИКИ ДЛЯ tasks ==========
create policy "tasks_select_manager_or_assignee"
  on public.tasks for select to authenticated
  using (
    public.is_manager()
    or assignee_id = (select auth.uid())
  );

create policy "tasks_insert_manager"
  on public.tasks for insert to authenticated
  with check (public.is_manager() and status = 'new');

create policy "tasks_update_manager"
  on public.tasks for update to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy "tasks_delete_manager"
  on public.tasks for delete to authenticated
  using (public.is_manager());

-- ========== ПОЛИТИКИ ДЛЯ task_history ==========
create policy "history_select_manager_or_assignee"
  on public.task_history for select to authenticated
  using (
    public.is_manager()
    or exists (select 1 from public.tasks where id = task_history.task_id and assignee_id = (select auth.uid()))
  );