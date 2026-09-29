import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../services/firebase_services.dart';
import '../../widgets/common.dart';
import '../../widgets/exercise_video.dart';

/// Conduz o treino série a série, com cronômetro de descanso e registro no final.
class WorkoutPlayerScreen extends StatefulWidget {
  const WorkoutPlayerScreen({super.key, required this.workoutId});
  final String workoutId;

  @override
  State<WorkoutPlayerScreen> createState() => _WorkoutPlayerScreenState();
}

enum _Phase { exercise, rest }

class _WorkoutPlayerScreenState extends State<WorkoutPlayerScreen> {
  final _started = DateTime.now();
  List<WorkoutStep>? _steps;
  Workout? _workout;
  Object? _error;

  int _index = 0;
  int _set = 1;
  _Phase _phase = _Phase.exercise;
  int _remaining = 0; // segundos do cronômetro (descanso ou exercício por tempo)
  bool _timerRunning = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([
        Api.instance.workout(widget.workoutId),
        Api.instance.workoutSteps(widget.workoutId),
      ]);
      setState(() {
        _workout = results[0] as Workout?;
        _steps = results[1] as List<WorkoutStep>;
      });
      _prepareExercise();
      FirebaseServices.logEvent('workout_start', {'workout_id': widget.workoutId});
    } catch (e) {
      setState(() => _error = e);
    }
  }

  WorkoutStep get _step => _steps![_index];

  void _prepareExercise() {
    if (_steps == null || _steps!.isEmpty) return;
    _stopTimer();
    setState(() {
      _phase = _Phase.exercise;
      _remaining = _step.durationSeconds ?? 0;
    });
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _timerRunning = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_remaining <= 1) {
        HapticFeedback.heavyImpact();
        _stopTimer();
        setState(() => _remaining = 0);
        _phase == _Phase.rest ? _prepareExercise() : _finishSet();
        return;
      }
      if (_remaining <= 4) HapticFeedback.selectionClick();
      setState(() => _remaining--);
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
    if (mounted) setState(() => _timerRunning = false);
  }

  void _finishSet() {
    _stopTimer();
    final lastSet = _set >= _step.sets;
    final lastExercise = _index >= _steps!.length - 1;
    if (lastSet && lastExercise) {
      _complete();
      return;
    }
    setState(() {
      if (lastSet) {
        _index++;
        _set = 1;
      } else {
        _set++;
      }
      _phase = _Phase.rest;
      _remaining = _steps![lastSet ? _index - 1 : _index].restSeconds;
    });
    if (_remaining > 0) {
      _startTimer();
    } else {
      _prepareExercise();
    }
  }

  void _goTo(int index) {
    setState(() {
      _index = index;
      _set = 1;
    });
    _prepareExercise();
  }

  Future<void> _complete() async {
    final duration = DateTime.now().difference(_started).inSeconds;
    final feeling = await showModalBottomSheet<int>(
      context: context,
      isDismissible: false,
      builder: (c) => _FinishSheet(minutes: (duration / 60).ceil()),
    );
    try {
      await Api.instance.logWorkout(workoutId: widget.workoutId, durationSeconds: duration, feeling: feeling);
      FirebaseServices.logEvent('workout_complete', {'workout_id': widget.workoutId, 'seconds': duration});
      if (mounted) {
        showSnack(context, 'Treino registrado. Parabéns!');
        context.pop();
      }
    } catch (_) {
      if (mounted) showSnack(context, 'Não foi possível salvar o treino. Verifique a conexão.');
    }
  }

  Future<bool> _confirmExit() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Sair do treino?'),
        content: const Text('Seu progresso neste treino não será salvo.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Continuar treinando')),
          TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Sair')),
        ],
      ),
    );
    return ok ?? false;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(),
        body: const MessageView(icon: Icons.wifi_off, title: 'Não foi possível carregar'),
      );
    }
    if (_steps == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_steps!.isEmpty) {
      final locked = _workout != null && !_workout!.isFree && !AppState.instance.isSubscriber;
      return Scaffold(
        appBar: AppBar(),
        body: MessageView(
          icon: locked ? Icons.lock_outline : Icons.fitness_center,
          title: locked ? 'Treino exclusivo para assinantes' : 'Este treino ainda não tem exercícios',
          action: locked
              ? FilledButton(onPressed: () => context.push('/assinatura'), child: const Text('Saiba mais'))
              : null,
        ),
      );
    }

    final step = _step;
    final progress = (_index + (_set - 1) / step.sets) / _steps!.length;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        if (await _confirmExit() && context.mounted) context.pop();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(_workout?.title ?? 'Treino'),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(4),
            child: LinearProgressIndicator(value: progress),
          ),
        ),
        body: _phase == _Phase.rest ? _buildRest() : _buildExercise(step),
      ),
    );
  }

  Widget _buildExercise(WorkoutStep step) {
    final ex = step.exercise;
    final timed = step.durationSeconds != null;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Exercício ${_index + 1} de ${_steps!.length}', style: TextStyle(color: Colors.grey.shade600)),
        const SizedBox(height: 6),
        Text(ex.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        const SizedBox(height: 14),
        if (ex.video != null)
          ExerciseVideo(videoId: ex.video!.id, onLocked: () => showSnack(context, 'Vídeo disponível para assinantes.')),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Pill('Série $_set de ${step.sets}', icon: Icons.repeat),
            const SizedBox(width: 8),
            Pill(timed ? '${step.durationSeconds}s' : '${step.reps ?? '12'} repetições', icon: Icons.bolt),
          ],
        ),
        if (timed) ...[
          const SizedBox(height: 18),
          Center(
            child: Text(_fmt(_remaining), style: const TextStyle(fontSize: 56, fontWeight: FontWeight.w800)),
          ),
        ],
        if (ex.instructions.isNotEmpty) ...[
          const SizedBox(height: 18),
          for (final (i, line) in ex.instructions.indexed)
            Padding(padding: const EdgeInsets.only(bottom: 6), child: Text('${i + 1}. $line')),
        ],
        if (step.notes != null) Text('Dica: ${step.notes}', style: const TextStyle(fontStyle: FontStyle.italic)),
        const SizedBox(height: 24),
        if (timed && !_timerRunning && _remaining > 0)
          FilledButton.icon(icon: const Icon(Icons.play_arrow), label: const Text('Iniciar'), onPressed: _startTimer)
        else if (timed && _timerRunning)
          OutlinedButton.icon(icon: const Icon(Icons.pause), label: const Text('Pausar'), onPressed: _stopTimer)
        else
          FilledButton.icon(icon: const Icon(Icons.check), label: const Text('Série concluída'), onPressed: _finishSet),
        if (timed) ...[
          const SizedBox(height: 10),
          TextButton(onPressed: _finishSet, child: const Text('Concluir série agora')),
        ],
        const SizedBox(height: 10),
        Row(
          children: [
            if (_index > 0)
              TextButton.icon(
                onPressed: () => _goTo(_index - 1),
                icon: const Icon(Icons.skip_previous),
                label: const Text('Anterior'),
              ),
            const Spacer(),
            if (_index < _steps!.length - 1)
              TextButton.icon(
                onPressed: () => _goTo(_index + 1),
                icon: const Icon(Icons.skip_next),
                label: const Text('Pular'),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildRest() {
    final next = _step;
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Descanso',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          Text(
            _fmt(_remaining),
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 72, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'A seguir: ${next.exercise.name} — série $_set de ${next.sets}',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade700),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(onPressed: () => setState(() => _remaining += 15), child: const Text('+15s')),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(onPressed: _prepareExercise, child: const Text('Pular descanso')),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _fmt(int s) => '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';
}

class _FinishSheet extends StatelessWidget {
  const _FinishSheet({required this.minutes});
  final int minutes;

  static const _faces = ['😫', '😕', '🙂', '😊', '🤩'];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.emoji_events, size: 56, color: Colors.amber),
            const SizedBox(height: 8),
            const Text('Treino concluído!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            Text('$minutes min de dedicação', style: TextStyle(color: Colors.grey.shade700)),
            const SizedBox(height: 20),
            const Text('Como você se sentiu?'),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                for (var i = 0; i < 5; i++)
                  InkWell(
                    borderRadius: BorderRadius.circular(30),
                    onTap: () => Navigator.pop(context, i + 1),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Text(_faces[i], style: const TextStyle(fontSize: 34)),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Pular')),
          ],
        ),
      ),
    );
  }
}
