-- 1. Заполнение профилей из auth.users
insert into public.profiles (id, email, full_name, role)
select id, email,
  case email
    when 'manager@test.com'   then 'Руководитель'
    when 'executor1@test.com' then 'Исполнитель 1'
    when 'executor2@test.com' then 'Исполнитель 2'
  end,
  case when email = 'manager@test.com' then 'manager' else 'executor' end
from auth.users
where email in ('manager@test.com','executor1@test.com','executor2@test.com');

-- 2. Создание объектов
insert into public.objects (id, name, address, created_by) values
  ('11111111-1111-1111-1111-111111111111', 'ЖК Солнечный', 'ул. Ленина, 10',
    (select id from public.profiles where email = 'manager@test.com')),
  ('22222222-2222-2222-2222-222222222222', 'Бизнес-центр Высота', 'пр. Мира, 25',
    (select id from public.profiles where email = 'manager@test.com'));

-- 3. Создание задач в разных статусах
insert into public.tasks (title, description, object_id, assignee_id, author_id, status)
select t.title, t.description, t.object_id::uuid,
  (select id from public.profiles where email = t.assignee),
  (select id from public.profiles where email = 'manager@test.com'),
  t.status
from (values
  ('Залить фундамент',       'Бетон М300',        '11111111-1111-1111-1111-111111111111', 'executor1@test.com', 'new'),
  ('Установить окна',        'Пластиковые',       '11111111-1111-1111-1111-111111111111', 'executor1@test.com', 'in_progress'),
  ('Провести электричество', 'Кабель ВВГ',        '22222222-2222-2222-2222-222222222222', 'executor2@test.com', 'on_review'),
  ('Покрасить фасад',        'Краска белая',      '22222222-2222-2222-2222-222222222222', 'executor2@test.com', 'rework'),
  ('Сдать этаж',             'Финальная приёмка', '11111111-1111-1111-1111-111111111111', 'executor1@test.com', 'accepted')
) as t(title, description, object_id, assignee, status);