import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../widgets/common.dart';
import '../../widgets/exercise_video.dart';

class WorkoutsScreen extends StatefulWidget {
  const WorkoutsScreen({super.key});

  @override
  State<WorkoutsScreen> createState() => _WorkoutsScreenState();
}

class _WorkoutsScreenState extends State<WorkoutsScreen> {
  String? _level;
  bool _onlyFavorites = false;
  Key _key = UniqueKey();

  Future<(List<Workout>, Set<String>)> _load() async {
    final results = await Future.wait([Api.instance.workouts(level: _level), Api.instance.favoriteIds('treino')]);
    return (results[0] as List<Workout>, results[1] as Set<String>);
  }

  void _setFilter(VoidCallback change) => setState(() {
    change();
    _key = UniqueKey();
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Treinos')),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                FilterChip(
                  label: const Text('Favoritos'),
                  avatar: const Icon(Icons.favorite, size: 16),
                  selected: _onlyFavorites,
                  onSelected: (v) => setState(() => _onlyFavorites = v),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('Todos'),
                  selected: _level == null,
                  onSelected: (_) => _setFilter(() => _level = null),
                ),
                for (final e in levelLabels.entries) ...[
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: Text(e.value),
                    selected: _level == e.key,
                    onSelected: (_) => _setFilter(() => _level = e.key),
                  ),
                ],
              ],
            ),
          ),
          Expanded(
            child: AsyncView<(List<Workout>, Set<String>)>(
              key: _key,
              load: _load,
              builder: (context, data, _) {
                final (all, favs) = data;
                final list = _onlyFavorites ? all.where((w) => favs.contains(w.id)).toList() : all;
                if (list.isEmpty) {
                  return MessageView(
                    icon: _onlyFavorites ? Icons.favorite_border : Icons.fitness_center,
                    title: _onlyFavorites ? 'Nenhum favorito ainda' : 'Nenhum treino por aqui',
                    message: _onlyFavorites ? 'Toque no coração de um treino para salvá-lo.' : null,
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (_, i) => WorkoutCard(workout: list[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class WorkoutCard extends StatelessWidget {
  const WorkoutCard({super.key, required this.workout, this.large = false});
  final Workout workout;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final locked = !workout.isFree && !AppState.instance.isSubscriber;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push('/treinos/${workout.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                NetImage(workout.coverUrl, height: large ? 180 : 130, radius: 0),
                if (locked)
                  const Positioned(
                    top: 10,
                    right: 10,
                    child: CircleAvatar(radius: 16, backgroundColor: Colors.white, child: Icon(Icons.lock, size: 18)),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(workout.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      Pill(levelLabels[workout.level] ?? workout.level, icon: Icons.signal_cellular_alt),
                      if (workout.durationMinutes != null)
                        Pill('${workout.durationMinutes} min', icon: Icons.timer_outlined),
                      if (workout.category != null) Pill(workout.category!),
                      if (workout.isFree) const Pill('Grátis', color: Colors.green),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class WorkoutDetailScreen extends StatefulWidget {
  const WorkoutDetailScreen({super.key, required this.workoutId});
  final String workoutId;

  @override
  State<WorkoutDetailScreen> createState() => _WorkoutDetailScreenState();
}

class _WorkoutDetailScreenState extends State<WorkoutDetailScreen> {
  bool? _favorite;

  Future<(Workout?, List<WorkoutStep>, bool)> _load() async {
    final results = await Future.wait([
      Api.instance.workout(widget.workoutId),
      Api.instance.workoutSteps(widget.workoutId),
      Api.instance.favoriteIds('treino'),
    ]);
    return (
      results[0] as Workout?,
      results[1] as List<WorkoutStep>,
      (results[2] as Set<String>).contains(widget.workoutId),
    );
  }

  Future<void> _toggleFavorite() async {
    final value = !(_favorite ?? false);
    setState(() => _favorite = value);
    try {
      await Api.instance.setFavorite('treino', widget.workoutId, value);
    } catch (_) {
      if (mounted) setState(() => _favorite = !value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsyncView<(Workout?, List<WorkoutStep>, bool)>(
        load: _load,
        builder: (context, data, _) {
          final (workout, steps, fav) = data;
          _favorite ??= fav;
          if (workout == null) {
            return Scaffold(
              appBar: AppBar(),
              body: const MessageView(icon: Icons.search_off, title: 'Treino não encontrado'),
            );
          }
          final locked = !workout.isFree && !AppState.instance.isSubscriber;
          return Stack(
            children: [
              CustomScrollView(
                slivers: [
                  SliverAppBar(
                    expandedHeight: 220,
                    pinned: true,
                    actions: [FavoriteButton(active: _favorite!, onPressed: _toggleFavorite)],
                    flexibleSpace: FlexibleSpaceBar(background: NetImage(workout.coverUrl, radius: 0)),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(20),
                    sliver: SliverList.list(
                      children: [
                        Text(workout.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            Pill(levelLabels[workout.level] ?? workout.level, icon: Icons.signal_cellular_alt),
                            if (workout.durationMinutes != null)
                              Pill('${workout.durationMinutes} min', icon: Icons.timer_outlined),
                            if (steps.isNotEmpty) Pill('${steps.length} exercícios', icon: Icons.format_list_numbered),
                          ],
                        ),
                        if (workout.description != null) ...[
                          const SizedBox(height: 14),
                          Text(workout.description!, style: const TextStyle(height: 1.5)),
                        ],
                        const SectionTitle('Exercícios'),
                        if (locked)
                          MessageViewCard(
                            icon: Icons.lock_outline,
                            title: 'Treino exclusivo para assinantes',
                            action: FilledButton(
                              onPressed: () => context.push('/assinatura'),
                              child: const Text('Saiba mais'),
                            ),
                          )
                        else if (steps.isEmpty)
                          const Text('Este treino ainda não tem exercícios.')
                        else
                          ...steps.map((s) => _StepTile(step: s)),
                        const SizedBox(height: 90),
                      ],
                    ),
                  ),
                ],
              ),
              Positioned(
                left: 20,
                right: 20,
                bottom: 16,
                child: SafeArea(
                  top: false,
                  child: locked
                      ? FilledButton.icon(
                          icon: const Icon(Icons.lock_open_rounded),
                          label: const Text('Assinar para liberar'),
                          onPressed: () => context.push('/assinatura'),
                        )
                      : FilledButton.icon(
                          icon: const Icon(Icons.play_arrow_rounded),
                          label: const Text('Começar treino'),
                          onPressed: steps.isEmpty ? null : () => context.push('/treinos/${widget.workoutId}/executar'),
                        ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Coração de favorito legível sobre fotos (fundo branco translúcido).
class FavoriteButton extends StatelessWidget {
  const FavoriteButton({super.key, required this.active, required this.onPressed});
  final bool active;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: IconButton(
        style: IconButton.styleFrom(backgroundColor: Colors.white.withValues(alpha: 0.85)),
        tooltip: active ? 'Remover dos favoritos' : 'Favoritar',
        icon: Icon(active ? Icons.favorite : Icons.favorite_border, color: Theme.of(context).colorScheme.primary),
        onPressed: onPressed,
      ),
    );
  }
}

class MessageViewCard extends StatelessWidget {
  const MessageViewCard({super.key, required this.icon, required this.title, this.action});
  final IconData icon;
  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(icon, size: 40, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            if (action != null) ...[const SizedBox(height: 14), action!],
          ],
        ),
      ),
    );
  }
}

class _StepTile extends StatelessWidget {
  const _StepTile({required this.step});
  final WorkoutStep step;

  @override
  Widget build(BuildContext context) {
    final ex = step.exercise;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ExpansionTile(
        shape: const Border(),
        leading: CircleAvatar(child: Text('${step.position}')),
        title: Text(ex.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text('${step.prescription} · descanso ${step.restSeconds}s'),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (ex.video != null) ExerciseVideo(videoId: ex.video!.id, autoplay: false),
          if (ex.description != null) ...[const SizedBox(height: 10), Text(ex.description!)],
          for (final (i, line) in ex.instructions.indexed)
            Padding(padding: const EdgeInsets.only(top: 6), child: Text('${i + 1}. $line')),
          if (step.notes != null) ...[
            const SizedBox(height: 8),
            Text('Dica: ${step.notes}', style: const TextStyle(fontStyle: FontStyle.italic)),
          ],
        ],
      ),
    );
  }
}
