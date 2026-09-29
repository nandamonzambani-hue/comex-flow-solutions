import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../services/firebase_services.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

class ChallengesScreen extends StatelessWidget {
  const ChallengesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Desafios')),
      body: AsyncView<List<Challenge>>(
        load: Api.instance.challenges,
        builder: (context, list, _) {
          if (list.isEmpty) {
            return const MessageView(icon: Icons.emoji_events_outlined, title: 'Novos desafios em breve');
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              final c = list[i];
              return Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => context.push('/desafios/${c.id}'),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      NetImage(c.coverUrl, height: 140, radius: 0, icon: Icons.emoji_events_outlined),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            Pill('${c.durationDays} dias', icon: Icons.calendar_month),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ChallengeData {
  _ChallengeData(this.challenge, this.days, this.joined, this.done);
  final Challenge? challenge;
  final List<ChallengeDay> days;
  final bool joined;
  final Set<int> done;
}

class ChallengeScreen extends StatefulWidget {
  const ChallengeScreen({super.key, required this.challengeId});
  final String challengeId;

  @override
  State<ChallengeScreen> createState() => _ChallengeScreenState();
}

class _ChallengeScreenState extends State<ChallengeScreen> {
  Future<_ChallengeData> _load() async {
    final api = Api.instance;
    final results = await Future.wait([
      api.challenge(widget.challengeId),
      api.challengeDays(widget.challengeId),
      api.isParticipant(widget.challengeId),
      api.checkins(widget.challengeId),
    ]);
    return _ChallengeData(
      results[0] as Challenge?,
      results[1] as List<ChallengeDay>,
      results[2] as bool,
      results[3] as Set<int>,
    );
  }

  Future<void> _join(Future<void> Function() reload) async {
    if (!AppState.instance.isSubscriber) {
      context.push('/assinatura');
      return;
    }
    try {
      await Api.instance.joinChallenge(widget.challengeId);
      FirebaseServices.logEvent('challenge_join', {'challenge_id': widget.challengeId});
      await reload();
    } catch (_) {
      if (mounted) showSnack(context, 'Não foi possível entrar no desafio.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Desafio')),
      body: AsyncView<_ChallengeData>(
        load: _load,
        builder: (context, data, reload) {
          final c = data.challenge;
          if (c == null) return const MessageView(icon: Icons.search_off, title: 'Desafio não encontrado');
          final progress = c.durationDays == 0 ? 0.0 : data.done.length / c.durationDays;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              NetImage(c.coverUrl, height: 170, icon: Icons.emoji_events_outlined),
              const SizedBox(height: 16),
              Text(c.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              if (c.description != null) ...[
                const SizedBox(height: 8),
                Text(c.description!, style: const TextStyle(height: 1.5)),
              ],
              if (c.goalDescription != null) ...[
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.flag_outlined, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(c.goalDescription!, style: const TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              if (!data.joined)
                FilledButton(
                  onPressed: () => _join(reload),
                  child: Text(AppState.instance.isSubscriber ? 'Participar do desafio' : 'Participar (assinantes)'),
                )
              else ...[
                Text(
                  '${data.done.length} de ${c.durationDays} dias concluídos',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: progress.clamp(0, 1),
                  minHeight: 10,
                  borderRadius: BorderRadius.circular(8),
                ),
              ],
              const SectionTitle('Dia a dia'),
              for (final d in data.days)
                Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: CheckboxListTile(
                    value: data.done.contains(d.dayNumber),
                    onChanged: !data.joined
                        ? null
                        : (v) async {
                            try {
                              await Api.instance.setCheckin(widget.challengeId, d.dayNumber, v ?? false);
                              await reload();
                            } catch (_) {
                              if (context.mounted) showSnack(context, 'Não foi possível salvar.');
                            }
                          },
                    title: Text('Dia ${d.dayNumber} · ${d.title}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (d.task != null) Text(d.task!),
                        if (d.workoutId != null)
                          TextButton.icon(
                            style: TextButton.styleFrom(padding: EdgeInsets.zero),
                            icon: const Icon(Icons.play_circle_outline, size: 18),
                            label: const Text('Abrir treino do dia'),
                            onPressed: () => context.push('/treinos/${d.workoutId}'),
                          ),
                      ],
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
