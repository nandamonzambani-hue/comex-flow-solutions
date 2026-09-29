import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/models.dart';

/// Acesso aos dados do Supabase. As regras de segurança (RLS) ficam no banco;
/// aqui só montamos as consultas.
class Api {
  Api();

  /// Substituível no modo demonstração (lib/demo/).
  static Api instance = Api();

  SupabaseClient get _db => Supabase.instance.client;
  String? get userId => _db.auth.currentUser?.id;

  // ------------------------------------------------------------------ perfil
  Future<Profile?> myProfile() async {
    final uid = userId;
    if (uid == null) return null;
    final row = await _db.from('profiles').select().eq('id', uid).maybeSingle();
    return row == null ? null : Profile.fromMap(row);
  }

  Future<void> updateProfile(Map<String, dynamic> values) async {
    await _db.from('profiles').update(values).eq('id', userId!);
  }

  Future<Subscription> mySubscription() async {
    final uid = userId;
    if (uid == null) return Subscription.none;
    final rows = await Future.wait([
      _db.from('subscriptions').select().eq('user_id', uid).maybeSingle(),
      _db.from('store_subscriptions').select().eq('user_id', uid).maybeSingle(),
    ]);
    return Subscription.pick(
      rows[0] == null ? null : Subscription.fromMap(rows[0]!),
      rows[1] == null ? null : Subscription.fromStoreMap(rows[1]!),
    );
  }

  Future<Stats> myStats() async {
    final rows = await _db.rpc('my_stats') as List<dynamic>;
    return rows.isEmpty ? Stats.empty : Stats.fromMap(rows.first as Map<String, dynamic>);
  }

  // ------------------------------------------------------------------ treinos
  Future<List<Workout>> workouts({String? level, String? category}) async {
    var q = _db.from('workouts').select();
    if (level != null) q = q.eq('level', level);
    if (category != null) q = q.eq('category', category);
    final rows = await q.order('created_at', ascending: false);
    return rows.map(Workout.fromMap).toList();
  }

  Future<Workout?> workout(String id) async {
    final row = await _db.from('workouts').select().eq('id', id).maybeSingle();
    return row == null ? null : Workout.fromMap(row);
  }

  /// Vazio quando o treino é premium e a aluna não é assinante (bloqueado pela RLS).
  Future<List<WorkoutStep>> workoutSteps(String workoutId) async {
    final rows = await _db
        .from('workout_exercises')
        .select('*, exercises(*, videos(id, title, duration_seconds, thumbnail_url))')
        .eq('workout_id', workoutId)
        .order('position');
    return rows.map(WorkoutStep.fromMap).toList();
  }

  Future<Workout?> suggestedWorkout(Profile profile) async {
    final rows = await _db
        .from('workouts')
        .select()
        .eq('level', profile.level)
        .order('created_at', ascending: false)
        .limit(10);
    if (rows.isEmpty) {
      final any = await _db.from('workouts').select().limit(1);
      return any.isEmpty ? null : Workout.fromMap(any.first);
    }
    final list = rows.map(Workout.fromMap).toList();
    final byGoal = list.where((w) => w.goal == profile.goal).toList();
    final pool = byGoal.isNotEmpty ? byGoal : list;
    return pool[DateTime.now().day % pool.length];
  }

  Future<void> logWorkout({
    required String workoutId,
    required int durationSeconds,
    int? feeling,
    String? notes,
  }) async {
    await _db.from('workout_logs').insert({
      'user_id': userId,
      'workout_id': workoutId,
      'duration_seconds': durationSeconds,
      'feeling': feeling,
      'notes': notes,
    });
  }

  Future<List<WorkoutLog>> workoutHistory({int limit = 30}) async {
    final rows = await _db
        .from('workout_logs')
        .select('*, workouts(title)')
        .eq('user_id', userId!)
        .order('completed_at', ascending: false)
        .limit(limit);
    return rows.map(WorkoutLog.fromMap).toList();
  }

  // ------------------------------------------------------------------ favoritos
  Future<Set<String>> favoriteIds(String type) async {
    final rows = await _db.from('favorites').select('item_id').eq('user_id', userId!).eq('item_type', type);
    return rows.map((r) => r['item_id'] as String).toSet();
  }

  Future<void> setFavorite(String type, String itemId, bool value) async {
    if (value) {
      await _db.from('favorites').upsert({'user_id': userId, 'item_type': type, 'item_id': itemId});
    } else {
      await _db.from('favorites').delete().eq('user_id', userId!).eq('item_type', type).eq('item_id', itemId);
    }
  }

  // ------------------------------------------------------------------ nutrição
  Future<List<Recipe>> recipes({String? mealType}) async {
    // A lista vem da vitrine (sem ingredientes/preparo); o detalhe completo exige acesso.
    var q = _db.from('recipe_previews').select();
    if (mealType != null) q = q.eq('meal_type', mealType);
    final rows = await q.order('title');
    return rows.map(Recipe.fromMap).toList();
  }

  /// Receita completa quando liberada; senão, só a vitrine (a tela mostra o cadeado).
  Future<Recipe?> recipe(String id) async {
    final row =
        await _db.from('recipes').select().eq('id', id).maybeSingle() ??
        await _db.from('recipe_previews').select().eq('id', id).maybeSingle();
    return row == null ? null : Recipe.fromMap(row);
  }

  Future<MealPlan?> mealPlan(String id) async {
    final row = await _db.from('meal_plans').select('*, meal_plan_items(*, recipes(*))').eq('id', id).maybeSingle();
    return row == null ? null : MealPlan.fromMap(row);
  }

  Future<List<MealPlan>> mealPlans() async {
    final rows = await _db.from('meal_plans').select('*, meal_plan_items(*, recipes(*))').order('title');
    return rows.map(MealPlan.fromMap).toList();
  }

  // ------------------------------------------------------------------ evolução
  Future<List<Measurement>> measurements() async {
    final rows = await _db
        .from('body_measurements')
        .select()
        .eq('user_id', userId!)
        .order('measured_at', ascending: true);
    return rows.map(Measurement.fromMap).toList();
  }

  Future<void> addMeasurement(Map<String, dynamic> values) async {
    await _db.from('body_measurements').insert({...values, 'user_id': userId});
  }

  Future<void> deleteMeasurement(String id) async {
    await _db.from('body_measurements').delete().eq('id', id);
  }

  // ------------------------------------------------------------------ desafios
  Future<List<Challenge>> challenges() async {
    final rows = await _db.from('challenges').select().order('created_at', ascending: false);
    return rows.map(Challenge.fromMap).toList();
  }

  Future<Challenge?> challenge(String id) async {
    final row = await _db.from('challenges').select().eq('id', id).maybeSingle();
    return row == null ? null : Challenge.fromMap(row);
  }

  Future<List<ChallengeDay>> challengeDays(String challengeId) async {
    final rows = await _db.from('challenge_days').select().eq('challenge_id', challengeId).order('day_number');
    return rows.map(ChallengeDay.fromMap).toList();
  }

  Future<bool> isParticipant(String challengeId) async {
    final row = await _db
        .from('challenge_participants')
        .select('challenge_id')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId!)
        .maybeSingle();
    return row != null;
  }

  Future<void> joinChallenge(String challengeId) async {
    await _db.from('challenge_participants').insert({'challenge_id': challengeId, 'user_id': userId});
  }

  Future<Set<int>> checkins(String challengeId) async {
    final rows = await _db
        .from('challenge_checkins')
        .select('day_number')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId!);
    return rows.map((r) => r['day_number'] as int).toSet();
  }

  Future<void> setCheckin(String challengeId, int day, bool done) async {
    if (done) {
      await _db.from('challenge_checkins').upsert({'challenge_id': challengeId, 'user_id': userId, 'day_number': day});
    } else {
      await _db
          .from('challenge_checkins')
          .delete()
          .eq('challenge_id', challengeId)
          .eq('user_id', userId!)
          .eq('day_number', day);
    }
  }

  // ------------------------------------------------------------------ conta
  Future<void> deleteAccount() async {
    await _db.functions.invoke('delete-account');
    await _db.auth.signOut();
  }
}
