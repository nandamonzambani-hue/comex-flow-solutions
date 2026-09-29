import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../workouts/workouts_screens.dart';

class _HomeData {
  _HomeData(this.stats, this.suggested, this.challenges);
  final Stats stats;
  final Workout? suggested;
  final List<Challenge> challenges;
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  Future<_HomeData> _load() async {
    final profile = AppState.instance.profile!;
    final results = await Future.wait([
      Api.instance.myStats(),
      Api.instance.suggestedWorkout(profile),
      Api.instance.challenges(),
    ]);
    return _HomeData(results[0] as Stats, results[1] as Workout?, results[2] as List<Challenge>);
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final name = state.profile?.firstName ?? '';
    return Scaffold(
      body: SafeArea(
        child: AsyncView<_HomeData>(
          load: _load,
          builder: (context, data, _) => ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: [
              Text(
                name.isEmpty ? '${_greeting()}!' : '${_greeting()}, $name!',
                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text('Cada treino conta. Vamos juntas?', style: TextStyle(color: Colors.grey.shade700)),
              const SizedBox(height: 20),
              Row(
                children: [
                  _StatCard(
                    icon: Icons.local_fire_department,
                    value: '${data.stats.currentStreak}',
                    label: 'dias seguidos',
                  ),
                  const SizedBox(width: 10),
                  _StatCard(icon: Icons.calendar_today, value: '${data.stats.workoutsThisWeek}', label: 'nesta semana'),
                  const SizedBox(width: 10),
                  _StatCard(icon: Icons.emoji_events_outlined, value: '${data.stats.totalWorkouts}', label: 'treinos'),
                ],
              ),
              if (!state.isSubscriber) ...[
                const SizedBox(height: 16),
                _SubscribeBanner(onTap: () => context.push('/assinatura')),
              ],
              const SectionTitle('Treino do dia'),
              if (data.suggested == null)
                const Card(
                  child: Padding(padding: EdgeInsets.all(20), child: Text('Novos treinos em breve!')),
                )
              else
                WorkoutCard(workout: data.suggested!, large: true),
              if (data.challenges.isNotEmpty) ...[
                SectionTitle(
                  'Desafios',
                  trailing: TextButton(onPressed: () => context.push('/desafios'), child: const Text('Ver todos')),
                ),
                SizedBox(
                  height: 150,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: data.challenges.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final c = data.challenges[i];
                      return SizedBox(
                        width: 240,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(18),
                          onTap: () => context.push('/desafios/${c.id}'),
                          child: Stack(
                            children: [
                              NetImage(c.coverUrl, height: 150, icon: Icons.emoji_events_outlined),
                              Positioned(
                                left: 12,
                                right: 12,
                                bottom: 12,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Pill('${c.durationDays} dias', color: Colors.white),
                                    const SizedBox(height: 6),
                                    Text(
                                      c.title,
                                      maxLines: 2,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 16,
                                        shadows: [Shadow(blurRadius: 8)],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
              const SectionTitle('Atalhos'),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  ActionChip(
                    avatar: const Icon(Icons.monitor_weight_outlined, size: 18),
                    label: const Text('Registrar peso'),
                    onPressed: () => context.go('/evolucao'),
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.restaurant_menu, size: 18),
                    label: const Text('Receitas'),
                    onPressed: () => context.go('/nutricao'),
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.history, size: 18),
                    label: const Text('Histórico'),
                    onPressed: () => context.push('/historico'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.icon, required this.value, required this.label});
  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
          child: Column(
            children: [
              Icon(icon, color: AppColors.primary),
              const SizedBox(height: 6),
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            ],
          ),
        ),
      ),
    );
  }
}

class _SubscribeBanner extends StatelessWidget {
  const _SubscribeBanner({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          gradient: const LinearGradient(colors: [AppColors.primary, AppColors.secondary]),
        ),
        child: const Row(
          children: [
            Icon(Icons.workspace_premium, color: Colors.white, size: 32),
            SizedBox(width: 14),
            Expanded(
              child: Text(
                'Libere todos os treinos, cardápios e desafios',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.white),
          ],
        ),
      ),
    );
  }
}
