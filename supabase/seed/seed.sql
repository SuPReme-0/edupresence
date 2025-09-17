-- Insert sample admin user
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-000000000000',
  'admin@edupresence.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User","role":"admin"}'
);

-- Insert sample teachers
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values 
(
  '11111111-1111-1111-1111-111111111111',
  'smith@edupresence.com',
  crypt('teacher123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dr. Smith","role":"teacher","department":"Mathematics","bluetooth_id":"BT001"}'
),
(
  '22222222-2222-2222-2222-222222222222',
  'johnson@edupresence.com',
  crypt('teacher123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Prof. Johnson","role":"teacher","department":"Physics","bluetooth_id":"BT002"}'
);

-- Insert sample students
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values 
(
  '33333333-3333-3333-3333-333333333333',
  'alex@edupresence.com',
  crypt('student123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Alex Chen","role":"student","department":"Computer Science","year":2,"enrollment_no":"CS2024001"}'
),
(
  '44444444-4444-4444-4444-444444444444',
  'maria@edupresence.com',
  crypt('student123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Maria Garcia","role":"student","department":"Mathematics","year":1,"enrollment_no":"MATH2024001"}'
);

-- Insert sample classes
insert into classes (id, name, teacher_id)
values 
  ('55555555-5555-5555-5555-555555555555', 'Math 101', '11111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-666666666666', 'Physics 201', '22222222-2222-2222-2222-222222222222');

-- Insert class-student relationships
insert into class_students (class_id, student_id)
values 
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444'),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333');