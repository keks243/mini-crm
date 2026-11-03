-- 1. Запрет прямой смены статуса
create or replace function public.prevent_direct_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('app.status_change_allowed', true), '') <> 'on' then
    raise exception 'Статус можно менять только через change_task_status';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_direct_status_change
before update on public.tasks
for each row execute function public.prevent_direct_status_change();

-- 2. Автоматическая запись в историю при создании задачи
create or replace function public.log_task_created()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.task_history (task_id, from_status, to_status, changed_by, comment)
  values (new.id, null, new.status, new.author_id, 'Задача создана');
  return new;
end;
$$;

create trigger trg_log_task_created
after insert on public.tasks
for each row execute function public.log_task_created();

-- 3. RPC для смены статуса (с проверкой прав и логированием)
create or replace function public.change_task_status(
  p_task_id uuid,
  p_new_status text,
  p_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_assignee uuid;
  v_status text;
  v_allowed boolean := false;
begin
  if v_user_id is null then
    raise exception 'Не авторизован';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Профиль не найден';
  end if;

  select assignee_id, status into v_assignee, v_status
  from public.tasks where id = p_task_id
  for update;

  if not found then
    raise exception 'Задача не найдена';
  end if;

  if v_role = 'executor' and v_user_id = v_assignee then
    v_allowed := (v_status = 'new'         and p_new_status = 'in_progress')
              or (v_status = 'in_progress' and p_new_status = 'on_review')
              or (v_status = 'rework'      and p_new_status = 'in_progress');
  elsif v_role = 'manager' then
    v_allowed := (v_status = 'on_review' and p_new_status in ('accepted','rework'));
  end if;

  if not v_allowed then
    raise exception 'Переход из % в % запрещён', v_status, p_new_status;
  end if;

  if p_new_status = 'rework' and (p_comment is null or trim(p_comment) = '') then
    raise exception 'Для возврата на доработку комментарий обязателен';
  end if;

  perform set_config('app.status_change_allowed', 'on', true);
  update public.tasks set status = p_new_status where id = p_task_id;

  insert into public.task_history (task_id, from_status, to_status, changed_by, comment)
  values (p_task_id, v_status, p_new_status, v_user_id, nullif(trim(p_comment), ''));
end;
$$;

revoke execute on function public.change_task_status(uuid, text, text) from public, anon;
grant execute on function public.change_task_status(uuid, text, text) to authenticated;