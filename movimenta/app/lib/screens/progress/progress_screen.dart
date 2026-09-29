import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../services/firebase_services.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

final _date = DateFormat('dd/MM/yyyy', 'pt_BR');
String _n(double? v, [String unit = '']) => v == null ? '–' : '${NumberFormat('#0.#', 'pt_BR').format(v)}$unit';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  Key _key = UniqueKey();

  Future<void> _add() async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _MeasurementForm(),
    );
    if (saved == true) setState(() => _key = UniqueKey());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Evolução')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _add,
        icon: const Icon(Icons.add),
        label: const Text('Nova medida'),
      ),
      body: AsyncView<List<Measurement>>(
        key: _key,
        load: Api.instance.measurements,
        builder: (context, list, reload) {
          final heightCm = AppState.instance.profile?.heightCm;
          final weights = list.where((m) => m.weightKg != null).toList();
          final last = weights.isEmpty ? null : weights.last.weightKg;
          final first = weights.isEmpty ? null : weights.first.weightKg;
          final bmi = (last != null && heightCm != null) ? last / ((heightCm / 100) * (heightCm / 100)) : null;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
            children: [
              Row(
                children: [
                  _Tile('Peso atual', _n(last, ' kg')),
                  const SizedBox(width: 10),
                  _Tile(
                    'Variação',
                    first == null || last == null ? '–' : '${last - first > 0 ? '+' : ''}${_n(last - first, ' kg')}',
                  ),
                  const SizedBox(width: 10),
                  _Tile('IMC', bmi == null ? '–' : bmi.toStringAsFixed(1)),
                ],
              ),
              const SectionTitle('Peso'),
              Card(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8, 20, 20, 8),
                  child: SizedBox(
                    height: 200,
                    child: weights.length < 2
                        ? const Center(child: Text('Registre pelo menos duas medidas para ver o gráfico.'))
                        : _WeightChart(weights),
                  ),
                ),
              ),
              SectionTitle(
                'Histórico de medidas',
                trailing: Text('${list.length} registros', style: TextStyle(color: Colors.grey.shade600)),
              ),
              if (list.isEmpty) const Text('Nenhuma medida ainda. Toque em "Nova medida".'),
              for (final m in list.reversed)
                Dismissible(
                  key: ValueKey(m.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Icon(Icons.delete_outline, color: Colors.red),
                  ),
                  confirmDismiss: (_) async =>
                      await showDialog<bool>(
                        context: context,
                        builder: (c) => AlertDialog(
                          title: const Text('Apagar medida?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancelar')),
                            TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Apagar')),
                          ],
                        ),
                      ) ??
                      false,
                  onDismissed: (_) async {
                    await Api.instance.deleteMeasurement(m.id);
                    reload();
                  },
                  child: Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(_date.format(m.measuredAt), style: const TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        [
                          if (m.weightKg != null) 'Peso ${_n(m.weightKg, ' kg')}',
                          if (m.waistCm != null) 'Cintura ${_n(m.waistCm, ' cm')}',
                          if (m.hipCm != null) 'Quadril ${_n(m.hipCm, ' cm')}',
                          if (m.chestCm != null) 'Busto ${_n(m.chestCm, ' cm')}',
                          if (m.armCm != null) 'Braço ${_n(m.armCm, ' cm')}',
                          if (m.thighCm != null) 'Coxa ${_n(m.thighCm, ' cm')}',
                          if (m.bodyFatPct != null) 'Gordura ${_n(m.bodyFatPct, '%')}',
                        ].join(' · '),
                      ),
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

class _Tile extends StatelessWidget {
  const _Tile(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          child: Column(
            children: [
              Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            ],
          ),
        ),
      ),
    );
  }
}

class _WeightChart extends StatelessWidget {
  const _WeightChart(this.data);
  final List<Measurement> data;

  @override
  Widget build(BuildContext context) {
    final start = data.first.measuredAt;
    final spots = [for (final m in data) FlSpot(m.measuredAt.difference(start).inDays.toDouble(), m.weightKg!)];
    final ys = spots.map((s) => s.y);
    final minY = (ys.reduce((a, b) => a < b ? a : b) - 2).floorToDouble();
    final maxY = (ys.reduce((a, b) => a > b ? a : b) + 2).ceilToDouble();
    return LineChart(
      LineChartData(
        minY: minY,
        maxY: maxY,
        gridData: const FlGridData(drawVerticalLine: false),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(),
          rightTitles: const AxisTitles(),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 36,
              getTitlesWidget: (v, meta) => Text(v.toStringAsFixed(0), style: const TextStyle(fontSize: 11)),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 24,
              interval: spots.last.x > 0 ? (spots.last.x / 3).ceilToDouble().clamp(1, double.infinity) : 1,
              getTitlesWidget: (v, meta) => Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  DateFormat('dd/MM').format(start.add(Duration(days: v.toInt()))),
                  style: const TextStyle(fontSize: 11),
                ),
              ),
            ),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            preventCurveOverShooting: true,
            color: AppColors.primary,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(show: true, color: AppColors.primary.withValues(alpha: 0.12)),
          ),
        ],
      ),
    );
  }
}

class _MeasurementForm extends StatefulWidget {
  const _MeasurementForm();

  @override
  State<_MeasurementForm> createState() => _MeasurementFormState();
}

class _MeasurementFormState extends State<_MeasurementForm> {
  static const _fields = {
    'weight_kg': ('Peso', 'kg'),
    'waist_cm': ('Cintura', 'cm'),
    'hip_cm': ('Quadril', 'cm'),
    'chest_cm': ('Busto', 'cm'),
    'arm_cm': ('Braço', 'cm'),
    'thigh_cm': ('Coxa', 'cm'),
    'body_fat_pct': ('Gordura corporal', '%'),
  };
  final _controllers = {for (final k in _fields.keys) k: TextEditingController()};
  DateTime _day = DateTime.now();
  bool _busy = false;

  Future<void> _save() async {
    final values = <String, dynamic>{};
    for (final e in _controllers.entries) {
      final v = double.tryParse(e.value.text.replaceAll(',', '.').trim());
      if (v != null) values[e.key] = v;
    }
    if (values.isEmpty) {
      showSnack(context, 'Preencha pelo menos uma medida.');
      return;
    }
    setState(() => _busy = true);
    try {
      await Api.instance.addMeasurement({...values, 'measured_at': DateFormat('yyyy-MM-dd').format(_day)});
      FirebaseServices.logEvent('measurement_add');
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted) showSnack(context, 'Confira os valores (peso entre 25 e 350 kg).');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.viewInsetsOf(context).bottom + 20),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Nova medida', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              icon: const Icon(Icons.event),
              label: Text(_date.format(_day)),
              onPressed: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: _day,
                  firstDate: DateTime(2020),
                  lastDate: DateTime.now(),
                );
                if (d != null) setState(() => _day = d);
              },
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final e in _fields.entries)
                  SizedBox(
                    width: (MediaQuery.sizeOf(context).width - 50) / 2,
                    child: TextField(
                      controller: _controllers[e.key],
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(labelText: e.value.$1, suffixText: e.value.$2),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: _busy ? null : _save, child: const Text('Salvar')),
          ],
        ),
      ),
    );
  }
}

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  static const _faces = ['😫', '😕', '🙂', '😊', '🤩'];

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat("EEEE, d 'de' MMMM · HH:mm", 'pt_BR');
    return Scaffold(
      appBar: AppBar(title: const Text('Histórico de treinos')),
      body: AsyncView<List<WorkoutLog>>(
        load: () => Api.instance.workoutHistory(limit: 100),
        builder: (context, logs, _) {
          if (logs.isEmpty) {
            return const MessageView(
              icon: Icons.history,
              title: 'Nenhum treino concluído ainda',
              message: 'Bora começar hoje?',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: logs.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final l = logs[i];
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.check)),
                  title: Text(l.workoutTitle ?? 'Treino', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(
                    [
                      fmt.format(l.completedAt),
                      if (l.durationSeconds != null) '${(l.durationSeconds! / 60).ceil()} min',
                    ].join(' · '),
                  ),
                  trailing: l.feeling == null
                      ? null
                      : Text(_faces[l.feeling! - 1], style: const TextStyle(fontSize: 24)),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
