// Modelos simples, construídos a partir dos mapas devolvidos pelo Supabase.

double? _d(dynamic v) => v == null ? null : (v as num).toDouble();
List<String> _list(dynamic v) => v == null ? const [] : List<String>.from(v as List);

const levelLabels = {'iniciante': 'Iniciante', 'intermediario': 'Intermediário', 'avancado': 'Avançado'};

const goalLabels = {
  'emagrecer': 'Emagrecer',
  'ganhar_massa': 'Ganhar massa muscular',
  'condicionamento': 'Condicionamento',
  'saude': 'Saúde e bem-estar',
  'flexibilidade': 'Flexibilidade',
};

const mealLabels = {
  'cafe_da_manha': 'Café da manhã',
  'lanche_manha': 'Lanche da manhã',
  'almoco': 'Almoço',
  'lanche_tarde': 'Lanche da tarde',
  'jantar': 'Jantar',
  'ceia': 'Ceia',
};

class Profile {
  Profile({
    required this.id,
    this.fullName,
    this.goal,
    required this.level,
    this.heightCm,
    this.trainingDaysPerWeek,
    required this.onboardingDone,
    required this.role,
  });

  final String id;
  final String? fullName;
  final String? goal;
  final String level;
  final double? heightCm;
  final int? trainingDaysPerWeek;
  final bool onboardingDone;
  final String role;

  String get firstName => (fullName ?? '').trim().split(' ').first;

  factory Profile.fromMap(Map<String, dynamic> m) => Profile(
    id: m['id'] as String,
    fullName: m['full_name'] as String?,
    goal: m['goal'] as String?,
    level: (m['level'] as String?) ?? 'iniciante',
    heightCm: _d(m['height_cm']),
    trainingDaysPerWeek: m['training_days_per_week'] as int?,
    onboardingDone: (m['onboarding_done'] as bool?) ?? false,
    role: (m['role'] as String?) ?? 'aluna',
  );
}

class Subscription {
  Subscription({
    required this.status,
    this.currentPeriodEnd,
    required this.cancelAtPeriodEnd,
    this.source = 'site',
    this.productId,
    this.billingIssue = false,
  });

  final String status;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;

  /// site (Stripe), app_store, play_store ou promotional.
  final String source;
  final String? productId;
  final bool billingIssue;

  bool get isActive =>
      (status == 'active' || status == 'trialing') &&
      (currentPeriodEnd == null || currentPeriodEnd!.isAfter(DateTime.now()));

  bool get fromStore => source == 'app_store' || source == 'play_store';

  /// Assinatura do site (tabela subscriptions).
  factory Subscription.fromMap(Map<String, dynamic> m) => Subscription(
    status: m['status'] as String,
    currentPeriodEnd: m['current_period_end'] == null ? null : DateTime.parse(m['current_period_end'] as String),
    cancelAtPeriodEnd: (m['cancel_at_period_end'] as bool?) ?? false,
  );

  /// Assinatura das lojas (tabela store_subscriptions, alimentada pelo RevenueCat).
  factory Subscription.fromStoreMap(Map<String, dynamic> m) => Subscription(
    status: m['status'] as String,
    currentPeriodEnd: m['current_period_end'] == null ? null : DateTime.parse(m['current_period_end'] as String),
    cancelAtPeriodEnd: !((m['will_renew'] as bool?) ?? false),
    source: (m['store'] as String?) ?? 'app_store',
    productId: m['product_id'] as String?,
    billingIssue: (m['billing_issue'] as bool?) ?? false,
  );

  /// Escolhe a assinatura que vale: a ativa (preferindo a da loja) ou, se nenhuma, a mais recente conhecida.
  static Subscription pick(Subscription? site, Subscription? store) {
    if (store != null && store.isActive) return store;
    if (site != null && site.isActive) return site;
    return site ?? store ?? none;
  }

  static final none = Subscription(status: 'inactive', cancelAtPeriodEnd: false);
}

class Video {
  Video({required this.id, required this.title, this.durationSeconds, this.thumbnailUrl});
  final String id;
  final String title;
  final int? durationSeconds;
  final String? thumbnailUrl;

  factory Video.fromMap(Map<String, dynamic> m) => Video(
    id: m['id'] as String,
    title: m['title'] as String,
    durationSeconds: m['duration_seconds'] as int?,
    thumbnailUrl: m['thumbnail_url'] as String?,
  );
}

class Exercise {
  Exercise({
    required this.id,
    required this.name,
    this.description,
    this.instructions = const [],
    this.muscleGroup,
    this.equipment,
    this.video,
  });

  final String id;
  final String name;
  final String? description;
  final List<String> instructions;
  final String? muscleGroup;
  final String? equipment;
  final Video? video;

  factory Exercise.fromMap(Map<String, dynamic> m) => Exercise(
    id: m['id'] as String,
    name: m['name'] as String,
    description: m['description'] as String?,
    instructions: _list(m['instructions']),
    muscleGroup: m['muscle_group'] as String?,
    equipment: m['equipment'] as String?,
    video: m['videos'] == null ? null : Video.fromMap(m['videos'] as Map<String, dynamic>),
  );
}

class WorkoutStep {
  WorkoutStep({
    required this.position,
    required this.sets,
    this.reps,
    this.durationSeconds,
    required this.restSeconds,
    this.notes,
    required this.exercise,
  });

  final int position;
  final int sets;
  final String? reps;
  final int? durationSeconds;
  final int restSeconds;
  final String? notes;
  final Exercise exercise;

  String get prescription {
    if (durationSeconds != null) return '$sets × ${durationSeconds}s';
    return '$sets × ${reps ?? '12'}';
  }

  factory WorkoutStep.fromMap(Map<String, dynamic> m) => WorkoutStep(
    position: m['position'] as int,
    sets: m['sets'] as int,
    reps: m['reps'] as String?,
    durationSeconds: m['duration_seconds'] as int?,
    restSeconds: (m['rest_seconds'] as int?) ?? 45,
    notes: m['notes'] as String?,
    exercise: Exercise.fromMap(m['exercises'] as Map<String, dynamic>),
  );
}

class Workout {
  Workout({
    required this.id,
    required this.title,
    this.description,
    this.coverUrl,
    this.category,
    this.goal,
    required this.level,
    this.durationMinutes,
    required this.isFree,
  });

  final String id;
  final String title;
  final String? description;
  final String? coverUrl;
  final String? category;
  final String? goal;
  final String level;
  final int? durationMinutes;
  final bool isFree;

  factory Workout.fromMap(Map<String, dynamic> m) => Workout(
    id: m['id'] as String,
    title: m['title'] as String,
    description: m['description'] as String?,
    coverUrl: m['cover_url'] as String?,
    category: m['category'] as String?,
    goal: m['goal'] as String?,
    level: (m['level'] as String?) ?? 'iniciante',
    durationMinutes: m['duration_minutes'] as int?,
    isFree: (m['is_free'] as bool?) ?? false,
  );
}

class Recipe {
  Recipe({
    required this.id,
    required this.title,
    this.description,
    this.imageUrl,
    this.mealType,
    this.prepMinutes,
    this.calories,
    this.proteinG,
    this.carbsG,
    this.fatG,
    this.ingredients = const [],
    this.steps = const [],
    required this.isFree,
  });

  final String id;
  final String title;
  final String? description;
  final String? imageUrl;
  final String? mealType;
  final int? prepMinutes;
  final int? calories;
  final double? proteinG;
  final double? carbsG;
  final double? fatG;
  final List<String> ingredients;
  final List<String> steps;
  final bool isFree;

  factory Recipe.fromMap(Map<String, dynamic> m) => Recipe(
    id: m['id'] as String,
    title: m['title'] as String,
    description: m['description'] as String?,
    imageUrl: m['image_url'] as String?,
    mealType: m['meal_type'] as String?,
    prepMinutes: m['prep_minutes'] as int?,
    calories: m['calories'] as int?,
    proteinG: _d(m['protein_g']),
    carbsG: _d(m['carbs_g']),
    fatG: _d(m['fat_g']),
    ingredients: _list(m['ingredients']),
    steps: _list(m['steps']),
    isFree: (m['is_free'] as bool?) ?? false,
  );
}

class MealPlanItem {
  MealPlanItem({required this.dayOfWeek, required this.mealType, this.recipe, this.description});
  final int dayOfWeek;
  final String mealType;
  final Recipe? recipe;
  final String? description;

  factory MealPlanItem.fromMap(Map<String, dynamic> m) => MealPlanItem(
    dayOfWeek: m['day_of_week'] as int,
    mealType: m['meal_type'] as String,
    recipe: m['recipes'] == null ? null : Recipe.fromMap(m['recipes'] as Map<String, dynamic>),
    description: m['description'] as String?,
  );
}

class MealPlan {
  MealPlan({required this.id, required this.title, this.description, this.dailyCalories, this.items = const []});
  final String id;
  final String title;
  final String? description;
  final int? dailyCalories;
  final List<MealPlanItem> items;

  factory MealPlan.fromMap(Map<String, dynamic> m) => MealPlan(
    id: m['id'] as String,
    title: m['title'] as String,
    description: m['description'] as String?,
    dailyCalories: m['daily_calories'] as int?,
    items: ((m['meal_plan_items'] as List?) ?? []).map((e) => MealPlanItem.fromMap(e as Map<String, dynamic>)).toList(),
  );
}

class Challenge {
  Challenge({
    required this.id,
    required this.title,
    this.description,
    this.coverUrl,
    required this.durationDays,
    this.goalDescription,
  });

  final String id;
  final String title;
  final String? description;
  final String? coverUrl;
  final int durationDays;
  final String? goalDescription;

  factory Challenge.fromMap(Map<String, dynamic> m) => Challenge(
    id: m['id'] as String,
    title: m['title'] as String,
    description: m['description'] as String?,
    coverUrl: m['cover_url'] as String?,
    durationDays: m['duration_days'] as int,
    goalDescription: m['goal_description'] as String?,
  );
}

class ChallengeDay {
  ChallengeDay({required this.dayNumber, required this.title, this.task, this.workoutId});
  final int dayNumber;
  final String title;
  final String? task;
  final String? workoutId;

  factory ChallengeDay.fromMap(Map<String, dynamic> m) => ChallengeDay(
    dayNumber: m['day_number'] as int,
    title: m['title'] as String,
    task: m['task'] as String?,
    workoutId: m['workout_id'] as String?,
  );
}

class Measurement {
  Measurement({
    required this.id,
    required this.measuredAt,
    this.weightKg,
    this.waistCm,
    this.hipCm,
    this.chestCm,
    this.armCm,
    this.thighCm,
    this.bodyFatPct,
  });

  final String id;
  final DateTime measuredAt;
  final double? weightKg;
  final double? waistCm;
  final double? hipCm;
  final double? chestCm;
  final double? armCm;
  final double? thighCm;
  final double? bodyFatPct;

  factory Measurement.fromMap(Map<String, dynamic> m) => Measurement(
    id: m['id'] as String,
    measuredAt: DateTime.parse(m['measured_at'] as String),
    weightKg: _d(m['weight_kg']),
    waistCm: _d(m['waist_cm']),
    hipCm: _d(m['hip_cm']),
    chestCm: _d(m['chest_cm']),
    armCm: _d(m['arm_cm']),
    thighCm: _d(m['thigh_cm']),
    bodyFatPct: _d(m['body_fat_pct']),
  );
}

class WorkoutLog {
  WorkoutLog({required this.id, required this.completedAt, this.workoutTitle, this.durationSeconds, this.feeling});
  final String id;
  final DateTime completedAt;
  final String? workoutTitle;
  final int? durationSeconds;
  final int? feeling;

  factory WorkoutLog.fromMap(Map<String, dynamic> m) => WorkoutLog(
    id: m['id'] as String,
    completedAt: DateTime.parse(m['completed_at'] as String).toLocal(),
    workoutTitle: (m['workouts'] as Map<String, dynamic>?)?['title'] as String?,
    durationSeconds: m['duration_seconds'] as int?,
    feeling: m['feeling'] as int?,
  );
}

class Stats {
  Stats({required this.totalWorkouts, required this.workoutsThisWeek, required this.currentStreak, this.lastWeightKg});
  final int totalWorkouts;
  final int workoutsThisWeek;
  final int currentStreak;
  final double? lastWeightKg;

  static final empty = Stats(totalWorkouts: 0, workoutsThisWeek: 0, currentStreak: 0);

  factory Stats.fromMap(Map<String, dynamic> m) => Stats(
    totalWorkouts: (m['total_workouts'] as num).toInt(),
    workoutsThisWeek: (m['workouts_this_week'] as num).toInt(),
    currentStreak: (m['current_streak'] as num).toInt(),
    lastWeightKg: _d(m['last_weight_kg']),
  );
}
