import 'package:flutter/material.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../services/firebase_services.dart';
import '../../widgets/common.dart';

/// Três passos: objetivo, nível/frequência e medidas iniciais (opcionais).
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pages = PageController();
  int _step = 0;
  String? _goal;
  String _level = 'iniciante';
  int _days = 3;
  final _height = TextEditingController();
  final _weight = TextEditingController();
  bool _busy = false;

  static const _goalIcons = {
    'emagrecer': Icons.local_fire_department_outlined,
    'ganhar_massa': Icons.fitness_center,
    'condicionamento': Icons.directions_run,
    'saude': Icons.favorite_border,
    'flexibilidade': Icons.self_improvement,
  };

  double? _num(TextEditingController c) => double.tryParse(c.text.replaceAll(',', '.').trim());

  Future<void> _next() async {
    if (_step == 0 && _goal == null) {
      showSnack(context, 'Escolha um objetivo para continuar.');
      return;
    }
    if (_step < 2) {
      setState(() => _step++);
      _pages.animateToPage(_step, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      return;
    }
    final height = _num(_height);
    final weight = _num(_weight);
    if (height != null && (height < 100 || height > 250)) {
      showSnack(context, 'Informe a altura em centímetros (ex.: 165).');
      return;
    }
    if (weight != null && (weight < 25 || weight > 350)) {
      showSnack(context, 'Informe o peso em quilos (ex.: 68,5).');
      return;
    }
    setState(() => _busy = true);
    try {
      if (weight != null) await Api.instance.addMeasurement({'weight_kg': weight});
      await Api.instance.updateProfile({
        'goal': _goal,
        'level': _level,
        'training_days_per_week': _days,
        'height_cm': height,
        'onboarding_done': true,
      });
      FirebaseServices.logEvent('onboarding_done', {'goal': _goal!, 'level': _level});
      await AppState.instance.refresh();
    } catch (_) {
      if (mounted) showSnack(context, 'Não foi possível salvar. Tente de novo.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = AppState.instance.profile?.firstName ?? '';
    return Scaffold(
      appBar: AppBar(
        leading: _step > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () {
                  setState(() => _step--);
                  _pages.animateToPage(_step, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                },
              )
            : null,
        title: LinearProgressIndicator(value: (_step + 1) / 3, borderRadius: BorderRadius.circular(8)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: _pages,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _page(
                    name.isEmpty ? 'Qual é o seu objetivo?' : 'Oi, $name! Qual é o seu objetivo?',
                    'Vamos montar sugestões de treino para você.',
                    goalLabels.entries
                        .map(
                          (e) => _option(
                            icon: _goalIcons[e.key]!,
                            label: e.value,
                            selected: _goal == e.key,
                            onTap: () => setState(() => _goal = e.key),
                          ),
                        )
                        .toList(),
                  ),
                  _page('Como está seu condicionamento?', 'Sem problema começar do zero!', [
                    ...levelLabels.entries.map(
                      (e) => _option(
                        icon: Icons.signal_cellular_alt,
                        label: e.value,
                        selected: _level == e.key,
                        onTap: () => setState(() => _level = e.key),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Quantos dias por semana quer treinar? $_days',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Slider(
                      value: _days.toDouble(),
                      min: 1,
                      max: 7,
                      divisions: 6,
                      label: '$_days',
                      onChanged: (v) => setState(() => _days = v.round()),
                    ),
                  ]),
                  _page('Seu ponto de partida', 'Opcional — serve para acompanhar sua evolução.', [
                    TextField(
                      controller: _height,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Altura (cm)', suffixText: 'cm'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _weight,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Peso (kg)', suffixText: 'kg'),
                    ),
                  ]),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: FilledButton(onPressed: _busy ? null : _next, child: Text(_step < 2 ? 'Continuar' : 'Começar')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _page(String title, String subtitle, List<Widget> children) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text(subtitle, style: TextStyle(color: Colors.grey.shade700)),
        const SizedBox(height: 24),
        ...children,
      ],
    );
  }

  Widget _option({required IconData icon, required String label, required bool selected, required VoidCallback onTap}) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: selected ? scheme.primaryContainer : Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(icon, color: scheme.primary),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
                if (selected) Icon(Icons.check_circle, color: scheme.primary),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
