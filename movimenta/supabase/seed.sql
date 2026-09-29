-- Conteúdo de exemplo para testar o app (sem vídeos). Rode no SQL Editor ou com `supabase db reset`.
insert into public.exercises (id, name, muscle_group, equipment, level, description, instructions) values
  ('a0000000-0000-0000-0000-000000000001', 'Agachamento livre', 'Pernas e glúteos', 'Peso do corpo', 'iniciante',
   'Base de todo treino de pernas.', '{"Pés na largura dos ombros","Desça como se fosse sentar, joelhos alinhados aos pés","Suba contraindo os glúteos"}'),
  ('a0000000-0000-0000-0000-000000000002', 'Elevação pélvica', 'Glúteos', 'Peso do corpo', 'iniciante',
   'Ativa os glúteos sem sobrecarregar a lombar.', '{"Deite de barriga para cima com joelhos dobrados","Eleve o quadril contraindo os glúteos","Desça devagar"}'),
  ('a0000000-0000-0000-0000-000000000003', 'Prancha', 'Abdômen', 'Peso do corpo', 'iniciante',
   'Fortalece todo o core.', '{"Apoie antebraços e pontas dos pés","Mantenha o corpo alinhado","Respire normalmente"}'),
  ('a0000000-0000-0000-0000-000000000004', 'Polichinelo', 'Corpo todo', 'Peso do corpo', 'iniciante',
   'Aquecimento e cardio.', '{"Salte abrindo pernas e braços","Volte à posição inicial"}')
on conflict do nothing;

insert into public.workouts (id, title, description, category, goal, level, duration_minutes, is_free, published) values
  ('b0000000-0000-0000-0000-000000000001', 'Primeiro treino: pernas em casa', 'Um treino curto para começar sem equipamento.',
   'Pernas e glúteos', 'emagrecer', 'iniciante', 20, true, true),
  ('b0000000-0000-0000-0000-000000000002', 'Core de aço', 'Abdômen e estabilidade em 15 minutos.',
   'Abdômen', 'condicionamento', 'iniciante', 15, false, true)
on conflict do nothing;

insert into public.workout_exercises (workout_id, exercise_id, position, sets, reps, duration_seconds, rest_seconds) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 1, 2, null, 40, 20),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 2, 3, '15', null, 45),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 3, 3, '15', null, 45),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 1, 3, null, 30, 30),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 2, 3, '20', null, 30)
on conflict do nothing;

insert into public.recipes (id, title, description, meal_type, prep_minutes, calories, protein_g, carbs_g, fat_g, ingredients, steps, is_free, published) values
  ('c0000000-0000-0000-0000-000000000001', 'Omelete de espinafre', 'Café da manhã rico em proteína.', 'cafe_da_manha', 10, 220, 16, 4, 15,
   '{"2 ovos","1 xícara de espinafre","Sal e pimenta a gosto","1 colher de chá de azeite"}',
   '{"Bata os ovos com sal e pimenta","Refogue o espinafre no azeite","Junte os ovos e cozinhe dos dois lados"}', true, true),
  ('c0000000-0000-0000-0000-000000000002', 'Bowl de frango e quinoa', 'Almoço completo e prático.', 'almoco', 25, 480, 38, 45, 14,
   '{"120 g de peito de frango","1/2 xícara de quinoa cozida","Tomate-cereja","Folhas verdes","Azeite e limão"}',
   '{"Grelhe o frango temperado","Monte o bowl com quinoa e folhas","Finalize com tomate, azeite e limão"}', false, true)
on conflict do nothing;

insert into public.challenges (id, title, description, duration_days, goal_description, published) values
  ('d0000000-0000-0000-0000-000000000001', 'Desafio 7 dias', 'Uma semana para criar o hábito.', 7, 'Mexer o corpo todos os dias', true)
on conflict do nothing;

insert into public.challenge_days (challenge_id, day_number, title, task, workout_id) values
  ('d0000000-0000-0000-0000-000000000001', 1, 'Começando', 'Faça o primeiro treino', 'b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000001', 2, 'Core', 'Treino de abdômen + 2 L de água', 'b0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000001', 3, 'Caminhada', '30 minutos de caminhada', null),
  ('d0000000-0000-0000-0000-000000000001', 4, 'Pernas', 'Repita o treino de pernas', 'b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000001', 5, 'Descanso ativo', 'Alongamento de 15 minutos', null),
  ('d0000000-0000-0000-0000-000000000001', 6, 'Core', 'Treino de abdômen', 'b0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000001', 7, 'Celebração', 'Registre suas medidas', null)
on conflict do nothing;
