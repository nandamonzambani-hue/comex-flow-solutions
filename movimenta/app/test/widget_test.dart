import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:movimenta/models/models.dart';
import 'package:movimenta/screens/workouts/workouts_screens.dart';
import 'package:movimenta/widgets/common.dart';

void main() {
  group('Subscription', () {
    test('ativa quando status active e período no futuro', () {
      final s = Subscription.fromMap({
        'status': 'active',
        'current_period_end': DateTime.now().add(const Duration(days: 3)).toIso8601String(),
      });
      expect(s.isActive, isTrue);
    });

    test('inativa quando período venceu ou status cancelado', () {
      expect(
        Subscription.fromMap({
          'status': 'active',
          'current_period_end': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        }).isActive,
        isFalse,
      );
      expect(Subscription.fromMap({'status': 'canceled'}).isActive, isFalse);
      expect(Subscription.none.isActive, isFalse);
    });
  });

  test('WorkoutStep monta a prescrição', () {
    final step = WorkoutStep.fromMap({
      'position': 1,
      'sets': 3,
      'reps': '10-12',
      'rest_seconds': 30,
      'exercises': {
        'id': 'e1',
        'name': 'Agachamento',
        'instructions': ['Desça devagar'],
      },
    });
    expect(step.prescription, '3 × 10-12');
    expect(step.exercise.instructions, ['Desça devagar']);
    final timed = WorkoutStep.fromMap({
      'position': 2,
      'sets': 2,
      'duration_seconds': 40,
      'exercises': {'id': 'e2', 'name': 'Prancha'},
    });
    expect(timed.prescription, '2 × 40s');
    expect(timed.restSeconds, 45);
  });

  testWidgets('MessageViewCard e Pill renderizam', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              Pill('Iniciante'),
              MessageViewCard(icon: Icons.lock, title: 'Treino exclusivo para assinantes'),
            ],
          ),
        ),
      ),
    );
    expect(find.text('Iniciante'), findsOneWidget);
    expect(find.text('Treino exclusivo para assinantes'), findsOneWidget);
  });
}
