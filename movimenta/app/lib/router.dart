import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'app_state.dart';
import 'screens/auth/auth_screens.dart';
import 'screens/challenges/challenges_screens.dart';
import 'screens/home/home_screen.dart';
import 'screens/nutrition/nutrition_screens.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/paywall/paywall_screen.dart';
import 'screens/profile/profile_screens.dart';
import 'screens/progress/progress_screen.dart';
import 'screens/workouts/workout_player_screen.dart';
import 'screens/workouts/workouts_screens.dart';

const _authRoutes = {'/entrar', '/cadastro', '/recuperar-senha'};

GoRouter buildRouter(AppState state) {
  return GoRouter(
    initialLocation: '/inicio',
    refreshListenable: state,
    redirect: (context, route) {
      final path = route.matchedLocation;
      final inAuth = _authRoutes.contains(path);
      if (!state.loggedIn) return inAuth ? null : '/entrar';
      if (state.profile == null) return path == '/carregando' ? null : '/carregando';
      if (!state.profile!.onboardingDone) return path == '/boas-vindas' ? null : '/boas-vindas';
      if (inAuth || path == '/carregando' || path == '/boas-vindas') return '/inicio';
      return null;
    },
    routes: [
      GoRoute(path: '/entrar', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/cadastro', builder: (_, _) => const SignupScreen()),
      GoRoute(path: '/recuperar-senha', builder: (_, _) => const ForgotPasswordScreen()),
      GoRoute(path: '/carregando', builder: (_, _) => const LoadingScreen()),
      GoRoute(path: '/boas-vindas', builder: (_, _) => const OnboardingScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, _, shell) => HomeShell(shell: shell),
        branches: [
          StatefulShellBranch(
            routes: [GoRoute(path: '/inicio', builder: (_, _) => const HomeScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/treinos', builder: (_, _) => const WorkoutsScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/nutricao', builder: (_, _) => const NutritionScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/evolucao', builder: (_, _) => const ProgressScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/perfil', builder: (_, _) => const ProfileScreen())],
          ),
        ],
      ),
      GoRoute(
        path: '/treinos/:id',
        builder: (_, s) => WorkoutDetailScreen(workoutId: s.pathParameters['id']!),
        routes: [
          GoRoute(
            path: 'executar',
            builder: (_, s) => WorkoutPlayerScreen(workoutId: s.pathParameters['id']!),
          ),
        ],
      ),
      GoRoute(
        path: '/receitas/:id',
        builder: (_, s) => RecipeScreen(recipeId: s.pathParameters['id']!),
      ),
      GoRoute(
        path: '/cardapios/:id',
        builder: (_, s) => MealPlanScreen(planId: s.pathParameters['id']!),
      ),
      GoRoute(path: '/desafios', builder: (_, _) => const ChallengesScreen()),
      GoRoute(
        path: '/desafios/:id',
        builder: (_, s) => ChallengeScreen(challengeId: s.pathParameters['id']!),
      ),
      GoRoute(path: '/historico', builder: (_, _) => const HistoryScreen()),
      GoRoute(path: '/perfil/editar', builder: (_, _) => const EditProfileScreen()),
      GoRoute(path: '/assinatura', builder: (_, _) => const PaywallScreen()),
    ],
  );
}

class HomeShell extends StatelessWidget {
  const HomeShell({super.key, required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Início'),
          NavigationDestination(
            icon: Icon(Icons.fitness_center_outlined),
            selectedIcon: Icon(Icons.fitness_center),
            label: 'Treinos',
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_outlined),
            selectedIcon: Icon(Icons.restaurant),
            label: 'Nutrição',
          ),
          NavigationDestination(
            icon: Icon(Icons.insights_outlined),
            selectedIcon: Icon(Icons.insights),
            label: 'Evolução',
          ),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }
}

class LoadingScreen extends StatelessWidget {
  const LoadingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) => Center(
          child: state.loadingProfile
              ? const CircularProgressIndicator()
              : Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Não foi possível carregar seu perfil.'),
                      const SizedBox(height: 16),
                      FilledButton(onPressed: state.refresh, child: const Text('Tentar de novo')),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
