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

  group('Assinatura das lojas', () {
    final future = DateTime.now().add(const Duration(days: 20)).toIso8601String();
    final past = DateTime.now().subtract(const Duration(days: 2)).toIso8601String();

    test('lê a assinatura da App Store', () {
      final s = Subscription.fromStoreMap({
        'store': 'app_store',
        'status': 'trialing',
        'current_period_end': future,
        'will_renew': true,
        'product_id': 'movimenta_anual',
      });
      expect(s.isActive, isTrue);
      expect(s.fromStore, isTrue);
      expect(s.cancelAtPeriodEnd, isFalse);
    });

    test('prefere a assinatura ativa, venha de onde vier', () {
      final siteExpired = Subscription.fromMap({'status': 'canceled', 'current_period_end': past});
      final storeActive = Subscription.fromStoreMap({
        'store': 'play_store',
        'status': 'active',
        'current_period_end': future,
      });
      expect(Subscription.pick(siteExpired, storeActive).source, 'play_store');

      final siteActive = Subscription.fromMap({'status': 'active', 'current_period_end': future});
      final storeExpired = Subscription.fromStoreMap({
        'store': 'app_store',
        'status': 'expired',
        'current_period_end': past,
      });
      expect(Subscription.pick(siteActive, storeExpired).source, 'site');
      expect(Subscription.pick(null, null).isActive, isFalse);
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
