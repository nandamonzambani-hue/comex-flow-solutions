import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import '../app_state.dart';
import '../models/models.dart';
import '../services/api.dart';

/// Modo demonstração: mesmas telas do app, com dados fictícios em memória.
/// Não acessa Supabase, lojas nem Cloudflare. Serve para ver o app no navegador
/// e para gerar prints das lojas: flutter run -d chrome -t lib/main_demo.dart
String _img(String id) => 'https://images.unsplash.com/photo-$id?w=900&q=70&auto=format&fit=crop';

final _now = DateTime.now();
String _daysAgo(int d) => _now.subtract(Duration(days: d)).toIso8601String();

class DemoApi extends Api {
  DemoApi({this.subscriber = true});
  final bool subscriber;

  final _favorites = <String, Set<String>>{
    'treino': {'w1', 'w4'},
    'receita': {'r2'},
  };
  final _checkins = <String, Set<int>>{
    'c1': {1, 2, 3, 4, 5, 6, 7, 8, 9},
  };
  final _joined = <String>{'c1'};
  late final List<Measurement> _measurements = [
    for (final (i, w) in [72.4, 71.8, 71.1, 70.6, 70.2, 69.5, 69.1, 68.4].indexed)
      Measurement.fromMap({
        'id': 'm$i',
        'measured_at': _now.subtract(Duration(days: (7 - i) * 10)).toIso8601String().substring(0, 10),
        'weight_kg': w,
        'waist_cm': 82 - i * 0.8,
        'hip_cm': 104 - i * 0.5,
      }),
  ];
  final _logs = <WorkoutLog>[
    for (final (i, t) in [
      'Pernas e glúteos em casa',
      'Core de aço',
      'HIIT queima total',
      'Yoga e alongamento',
      'Força: parte superior',
      'Pernas e glúteos em casa',
      'Core de aço',
    ].indexed)
      WorkoutLog.fromMap({
        'id': 'l$i',
        'completed_at': _daysAgo(i == 0 ? 0 : i + (i > 3 ? 1 : 0)),
        'workouts': {'title': t},
        'duration_seconds': [1260, 900, 1380, 1500, 1680, 1200, 960][i],
        'feeling': [5, 4, 4, 5, 3, 4, 5][i],
      }),
  ];

  static final _workouts = [
    {
      'id': 'w1',
      'title': 'Pernas e glúteos em casa',
      'category': 'Pernas e glúteos',
      'goal': 'emagrecer',
      'level': 'iniciante',
      'duration_minutes': 20,
      'is_free': true,
      'cover_url': _img('1518611012118-696072aa579a'),
      'description':
          'Treino sem equipamento para fortalecer pernas e glúteos. Ideal para começar ou para dias corridos.',
    },
    {
      'id': 'w2',
      'title': 'Core de aço',
      'category': 'Abdômen',
      'goal': 'condicionamento',
      'level': 'iniciante',
      'duration_minutes': 15,
      'is_free': false,
      'cover_url': _img('1571019613454-1cb2f99b2d8b'),
      'description': 'Abdômen e estabilidade em 15 minutos, com foco em postura e respiração.',
    },
    {
      'id': 'w3',
      'title': 'Força: parte superior',
      'category': 'Braços e costas',
      'goal': 'ganhar_massa',
      'level': 'intermediario',
      'duration_minutes': 35,
      'is_free': false,
      'cover_url': _img('1541534741688-6078c6bfb5c5'),
      'description': 'Costas, ombros e braços com halteres e barra.',
    },
    {
      'id': 'w4',
      'title': 'Yoga e alongamento',
      'category': 'Mobilidade',
      'goal': 'flexibilidade',
      'level': 'iniciante',
      'duration_minutes': 25,
      'is_free': false,
      'cover_url': _img('1552196563-55cd4e45efb3'),
      'description': 'Sequência suave para soltar o corpo e acalmar a mente.',
    },
    {
      'id': 'w5',
      'title': 'HIIT queima total',
      'category': 'HIIT',
      'goal': 'emagrecer',
      'level': 'avancado',
      'duration_minutes': 22,
      'is_free': false,
      'cover_url': _img('1599058917212-d750089bc07e'),
      'description': 'Intervalos intensos para acelerar o metabolismo.',
    },
  ];

  static final _exercises = {
    'agachamento': {
      'id': 'e1',
      'name': 'Agachamento livre',
      'muscle_group': 'Pernas e glúteos',
      'description': 'Base de todo treino de pernas.',
      'instructions': [
        'Pés na largura dos ombros',
        'Desça como se fosse sentar, joelhos alinhados aos pés',
        'Suba contraindo os glúteos',
      ],
    },
    'elevacao': {
      'id': 'e2',
      'name': 'Elevação pélvica',
      'muscle_group': 'Glúteos',
      'instructions': ['Deite com os joelhos dobrados', 'Eleve o quadril contraindo os glúteos', 'Desça devagar'],
    },
    'afundo': {
      'id': 'e3',
      'name': 'Afundo alternado',
      'muscle_group': 'Pernas',
      'instructions': ['Dê um passo à frente', 'Desça até o joelho de trás quase tocar o chão', 'Volte e alterne'],
    },
    'polichinelo': {
      'id': 'e4',
      'name': 'Polichinelo',
      'muscle_group': 'Corpo todo',
      'instructions': ['Salte abrindo pernas e braços', 'Volte à posição inicial'],
    },
    'prancha': {
      'id': 'e5',
      'name': 'Prancha',
      'muscle_group': 'Abdômen',
      'instructions': ['Apoie antebraços e pontas dos pés', 'Mantenha o corpo alinhado', 'Respire normalmente'],
    },
    'coice': {
      'id': 'e6',
      'name': 'Coice de glúteo',
      'muscle_group': 'Glúteos',
      'instructions': ['Em quatro apoios', 'Eleve uma perna para trás e para cima', 'Controle a descida'],
    },
  };

  List<WorkoutStep> _steps(String workoutId) {
    final plan = switch (workoutId) {
      'w2' => [('prancha', 3, null, 30, 30), ('elevacao', 3, '20', null, 30), ('polichinelo', 2, null, 40, 20)],
      _ => [
        ('polichinelo', 2, null, 40, 20),
        ('agachamento', 3, '15', null, 45),
        ('afundo', 3, '12 cada perna', null, 45),
        ('elevacao', 3, '15', null, 45),
        ('coice', 3, '15 cada perna', null, 30),
        ('prancha', 2, null, 30, 30),
      ],
    };
    return [
      for (final (i, (ex, sets, reps, secs, rest)) in plan.indexed)
        WorkoutStep.fromMap({
          'position': i + 1,
          'sets': sets,
          'reps': reps,
          'duration_seconds': secs,
          'rest_seconds': rest,
          'notes': ex == 'agachamento' ? 'Mantenha o peso nos calcanhares.' : null,
          'exercises': _exercises[ex],
        }),
    ];
  }

  static final _recipes = [
    {
      'id': 'r1',
      'title': 'Torrada com ovo e abacate',
      'meal_type': 'cafe_da_manha',
      'prep_minutes': 10,
      'calories': 320,
      'protein_g': 15,
      'carbs_g': 24,
      'fat_g': 18,
      'is_free': true,
      'image_url': _img('1525351484163-7529414344d8'),
      'description': 'Café da manhã completo e saciante.',
      'ingredients': ['1 fatia de pão integral', '1 ovo', '1/2 abacate pequeno', 'Sal, pimenta e limão'],
      'steps': [
        'Toste o pão',
        'Amasse o abacate com sal e limão e espalhe sobre o pão',
        'Frite o ovo e coloque por cima',
      ],
    },
    {
      'id': 'r2',
      'title': 'Bowl de frango e legumes',
      'meal_type': 'almoco',
      'prep_minutes': 25,
      'calories': 480,
      'protein_g': 38,
      'carbs_g': 42,
      'fat_g': 14,
      'is_free': false,
      'image_url': _img('1546069901-ba9599a7e63c'),
      'description': 'Almoço completo, colorido e rico em proteína.',
      'ingredients': [
        '120 g de peito de frango',
        '1/2 xícara de milho',
        'Pepino e tomate',
        'Repolho roxo',
        '1 ovo cozido',
      ],
      'steps': ['Grelhe o frango temperado', 'Pique os legumes', 'Monte o bowl e finalize com azeite e limão'],
    },
    {
      'id': 'r3',
      'title': 'Bowl vegano de grão-de-bico',
      'meal_type': 'jantar',
      'prep_minutes': 20,
      'calories': 410,
      'protein_g': 16,
      'carbs_g': 48,
      'fat_g': 17,
      'is_free': false,
      'image_url': _img('1512621776951-a57141f2eefd'),
      'description': 'Leve, colorido e cheio de fibras.',
      'ingredients': ['1/2 xícara de grão-de-bico', 'Abacate', 'Batata-doce assada', 'Folhas verdes', 'Tomate-cereja'],
      'steps': ['Asse a batata-doce em cubos', 'Monte com os demais ingredientes', 'Tempere a gosto'],
    },
    {
      'id': 'r4',
      'title': 'Frango com vagem e quinoa',
      'meal_type': 'almoco',
      'prep_minutes': 30,
      'calories': 450,
      'protein_g': 36,
      'carbs_g': 40,
      'fat_g': 12,
      'is_free': false,
      'image_url': _img('1547592180-85f173990554'),
      'ingredients': ['120 g de frango', '1/2 xícara de quinoa', 'Vagem', 'Cenoura'],
      'steps': ['Cozinhe a quinoa', 'Refogue a vagem e a cenoura', 'Grelhe o frango e sirva'],
    },
    {
      'id': 'r5',
      'title': 'Iogurte com frutas e granola',
      'meal_type': 'lanche_tarde',
      'prep_minutes': 5,
      'calories': 260,
      'protein_g': 12,
      'carbs_g': 36,
      'fat_g': 7,
      'is_free': true,
      'image_url': _img('1494390248081-4e521a5940db'),
      'ingredients': ['1 pote de iogurte natural', 'Frutas vermelhas', '2 colheres de granola'],
      'steps': ['Coloque o iogurte na tigela', 'Cubra com as frutas e a granola'],
    },
    {
      'id': 'r6',
      'title': 'Salada completa com ovo',
      'meal_type': 'jantar',
      'prep_minutes': 15,
      'calories': 340,
      'protein_g': 18,
      'carbs_g': 20,
      'fat_g': 20,
      'is_free': false,
      'image_url': _img('1490645935967-10de6ba17061'),
      'ingredients': ['Folhas verdes', '2 ovos cozidos', 'Tomate', 'Abacate', 'Sementes'],
      'steps': ['Monte a salada', 'Tempere com azeite, sal e limão'],
    },
  ];

  static final _challenges = [
    {
      'id': 'c1',
      'title': 'Desafio 21 dias',
      'duration_days': 21,
      'cover_url': _img('1506126613408-eca07ce68773'),
      'description': 'Três semanas para transformar o movimento em hábito.',
      'goal_description': 'Mexer o corpo todos os dias',
    },
    {
      'id': 'c2',
      'title': 'Glúteos em 30 dias',
      'duration_days': 30,
      'cover_url': _img('1434682881908-b43d0467b798'),
      'description': 'Treinos progressivos para glúteos e posterior.',
      'goal_description': 'Completar os 30 treinos',
    },
  ];

  // ------------------------------------------------------------------ perfil
  @override
  Future<Profile?> myProfile() async => AppState.instance.profile;

  @override
  Future<void> updateProfile(Map<String, dynamic> values) async {}

  @override
  Future<Subscription> mySubscription() async => AppState.instance.subscription;

  @override
  Future<Stats> myStats() async => Stats(totalWorkouts: 38, workoutsThisWeek: 4, currentStreak: 6, lastWeightKg: 68.4);

  // ------------------------------------------------------------------ treinos
  @override
  Future<List<Workout>> workouts({String? level, String? category}) async =>
      _workouts.map(Workout.fromMap).where((w) => level == null || w.level == level).toList();

  @override
  Future<Workout?> workout(String id) async => _workouts.where((w) => w['id'] == id).map(Workout.fromMap).firstOrNull;

  @override
  Future<List<WorkoutStep>> workoutSteps(String workoutId) async {
    final w = await workout(workoutId);
    if (w == null || (!w.isFree && !subscriber)) return const [];
    return _steps(workoutId);
  }

  @override
  Future<Workout?> suggestedWorkout(Profile profile) async => workout('w1');

  @override
  Future<void> logWorkout({
    required String workoutId,
    required int durationSeconds,
    int? feeling,
    String? notes,
  }) async {
    final w = await workout(workoutId);
    _logs.insert(
      0,
      WorkoutLog.fromMap({
        'id': 'l${_logs.length}',
        'completed_at': DateTime.now().toIso8601String(),
        'workouts': {'title': w?.title},
        'duration_seconds': durationSeconds,
        'feeling': feeling,
      }),
    );
  }

  @override
  Future<List<WorkoutLog>> workoutHistory({int limit = 30}) async => _logs.take(limit).toList();

  // ------------------------------------------------------------------ favoritos
  @override
  Future<Set<String>> favoriteIds(String type) async => {...?_favorites[type]};

  @override
  Future<void> setFavorite(String type, String itemId, bool value) async {
    final set = _favorites.putIfAbsent(type, () => {});
    value ? set.add(itemId) : set.remove(itemId);
  }

  // ------------------------------------------------------------------ nutrição
  @override
  Future<List<Recipe>> recipes({String? mealType}) async =>
      _recipes.map(Recipe.fromMap).where((r) => mealType == null || r.mealType == mealType).toList();

  @override
  Future<Recipe?> recipe(String id) async => _recipes.where((r) => r['id'] == id).map(Recipe.fromMap).firstOrNull;

  MealPlan _plan() {
    const meals = ['cafe_da_manha', 'almoco', 'lanche_tarde', 'jantar'];
    const byMeal = {
      'cafe_da_manha': ['r1', 'r5'],
      'almoco': ['r2', 'r4'],
      'lanche_tarde': ['r5', 'r1'],
      'jantar': ['r3', 'r6'],
    };
    return MealPlan.fromMap({
      'id': 'p1',
      'title': 'Cardápio leve — 1.500 kcal',
      'description': 'Para emagrecer com saúde',
      'daily_calories': 1500,
      'meal_plan_items': [
        for (var day = 1; day <= 7; day++)
          for (final m in meals)
            {'day_of_week': day, 'meal_type': m, 'recipes': _recipes.firstWhere((r) => r['id'] == byMeal[m]![day % 2])},
      ],
    });
  }

  @override
  Future<MealPlan?> mealPlan(String id) async => subscriber ? _plan() : null;

  @override
  Future<List<MealPlan>> mealPlans() async => subscriber
      ? [
          _plan(),
          MealPlan.fromMap({
            'id': 'p2',
            'title': 'Ganho de massa — 2.100 kcal',
            'description': 'Mais proteína',
            'daily_calories': 2100,
          }),
          MealPlan.fromMap({'id': 'p3', 'title': 'Vegetariano — 1.700 kcal', 'daily_calories': 1700}),
        ]
      : const [];

  // ------------------------------------------------------------------ evolução
  @override
  Future<List<Measurement>> measurements() async => [..._measurements];

  @override
  Future<void> addMeasurement(Map<String, dynamic> values) async {
    _measurements.add(
      Measurement.fromMap({'id': 'm${_measurements.length}', 'measured_at': _now.toIso8601String(), ...values}),
    );
    _measurements.sort((a, b) => a.measuredAt.compareTo(b.measuredAt));
  }

  @override
  Future<void> deleteMeasurement(String id) async => _measurements.removeWhere((m) => m.id == id);

  // ------------------------------------------------------------------ desafios
  @override
  Future<List<Challenge>> challenges() async => _challenges.map(Challenge.fromMap).toList();

  @override
  Future<Challenge?> challenge(String id) async =>
      _challenges.where((c) => c['id'] == id).map(Challenge.fromMap).firstOrNull;

  @override
  Future<List<ChallengeDay>> challengeDays(String challengeId) async {
    final c = await challenge(challengeId);
    const titles = [
      'Pernas em casa',
      'Core',
      'Caminhada de 30 min',
      'Glúteos',
      'Alongamento',
      'HIIT',
      'Descanso ativo',
    ];
    const tasks = [
      'Beba 2 L de água',
      'Durma 8 horas',
      'Coma uma fruta a mais',
      'Registre seu peso',
      'Faça 10 min de alongamento',
      'Suba escadas hoje',
      'Prepare as marmitas da semana',
    ];
    return [
      for (var d = 1; d <= (c?.durationDays ?? 0); d++)
        ChallengeDay.fromMap({
          'day_number': d,
          'title': titles[(d - 1) % 7],
          'task': tasks[(d - 1) % 7],
          'workout_id': (d - 1) % 7 == 0
              ? 'w1'
              : (d - 1) % 7 == 1
              ? 'w2'
              : null,
        }),
    ];
  }

  @override
  Future<bool> isParticipant(String challengeId) async => _joined.contains(challengeId);

  @override
  Future<void> joinChallenge(String challengeId) async => _joined.add(challengeId);

  @override
  Future<Set<int>> checkins(String challengeId) async => {...?_checkins[challengeId]};

  @override
  Future<void> setCheckin(String challengeId, int day, bool done) async {
    final set = _checkins.putIfAbsent(challengeId, () => {});
    done ? set.add(day) : set.remove(day);
  }

  @override
  Future<void> deleteAccount() async => debugPrint('Demo: exclusão de conta simulada');
}

/// Estado de uma aluna fictícia, sem Supabase Auth.
class DemoAppState extends AppState {
  DemoAppState({required this.demoLoggedIn, required bool onboardingDone, required bool subscriber})
    : super(listenToAuth: false) {
    profile = Profile(
      id: 'demo',
      fullName: 'Ana Souza',
      goal: 'emagrecer',
      level: 'iniciante',
      heightCm: 165,
      trainingDaysPerWeek: 4,
      onboardingDone: onboardingDone,
      role: 'aluna',
    );
    subscription = subscriber
        ? Subscription(
            status: 'active',
            currentPeriodEnd: DateTime.now().add(const Duration(days: 23)),
            cancelAtPeriodEnd: false,
            source: 'app_store',
            productId: 'movimenta_anual',
          )
        : Subscription.none;
  }

  bool demoLoggedIn;

  @override
  bool get loggedIn => demoLoggedIn;

  @override
  Future<void> refresh() async => notifyListeners();
}

/// Planos fictícios da tela de assinatura (os reais vêm da App Store / Google Play).
List<Package> demoPackages() {
  const ctx = PresentedOfferingContext('default', null, null);
  return [
    Package(
      r'$rc_annual',
      PackageType.annual,
      const StoreProduct(
        'movimenta_anual',
        'Acesso completo por 1 ano',
        'Premium anual',
        239.90,
        r'R$ 239,90',
        'BRL',
        introductoryPrice: IntroductoryPrice(0, r'R$ 0,00', 'P7D', 1, PeriodUnit.day, 7),
      ),
      ctx,
    ),
    Package(
      r'$rc_monthly',
      PackageType.monthly,
      const StoreProduct('movimenta_mensal', 'Acesso completo por 1 mês', 'Premium mensal', 34.90, r'R$ 34,90', 'BRL'),
      ctx,
    ),
  ];
}
