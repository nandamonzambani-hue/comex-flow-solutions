import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app_state.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../widgets/common.dart';
import '../workouts/workouts_screens.dart' show MessageViewCard;

class NutritionScreen extends StatelessWidget {
  const NutritionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Nutrição'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Receitas'),
              Tab(text: 'Cardápios'),
            ],
          ),
        ),
        body: const TabBarView(children: [_RecipesTab(), _MealPlansTab()]),
      ),
    );
  }
}

class _RecipesTab extends StatefulWidget {
  const _RecipesTab();

  @override
  State<_RecipesTab> createState() => _RecipesTabState();
}

class _RecipesTabState extends State<_RecipesTab> with AutomaticKeepAliveClientMixin {
  String? _meal;
  bool _onlyFavorites = false;
  Key _key = UniqueKey();

  @override
  bool get wantKeepAlive => true;

  Future<(List<Recipe>, Set<String>)> _load() async {
    final results = await Future.wait([Api.instance.recipes(mealType: _meal), Api.instance.favoriteIds('receita')]);
    return (results[0] as List<Recipe>, results[1] as Set<String>);
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Column(
      children: [
        SizedBox(
          height: 52,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            children: [
              FilterChip(
                label: const Text('Favoritas'),
                avatar: const Icon(Icons.favorite, size: 16),
                selected: _onlyFavorites,
                onSelected: (v) => setState(() => _onlyFavorites = v),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Todas'),
                selected: _meal == null,
                onSelected: (_) => setState(() {
                  _meal = null;
                  _key = UniqueKey();
                }),
              ),
              for (final e in mealLabels.entries) ...[
                const SizedBox(width: 8),
                ChoiceChip(
                  label: Text(e.value),
                  selected: _meal == e.key,
                  onSelected: (_) => setState(() {
                    _meal = e.key;
                    _key = UniqueKey();
                  }),
                ),
              ],
            ],
          ),
        ),
        Expanded(
          child: AsyncView<(List<Recipe>, Set<String>)>(
            key: _key,
            load: _load,
            builder: (context, data, _) {
              final (all, favs) = data;
              final list = _onlyFavorites ? all.where((r) => favs.contains(r.id)).toList() : all;
              if (list.isEmpty) return const MessageView(icon: Icons.restaurant, title: 'Nenhuma receita encontrada');
              return GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 260,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.78,
                ),
                itemCount: list.length,
                itemBuilder: (context, i) => _RecipeCard(recipe: list[i]),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _RecipeCard extends StatelessWidget {
  const _RecipeCard({required this.recipe});
  final Recipe recipe;

  @override
  Widget build(BuildContext context) {
    final locked = !recipe.isFree && !AppState.instance.isSubscriber;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push('/receitas/${recipe.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  NetImage(recipe.imageUrl, radius: 0, icon: Icons.restaurant),
                  if (locked)
                    const Positioned(
                      top: 8,
                      right: 8,
                      child: CircleAvatar(radius: 14, backgroundColor: Colors.white, child: Icon(Icons.lock, size: 16)),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    recipe.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    [
                      if (recipe.prepMinutes != null) '${recipe.prepMinutes} min',
                      if (recipe.calories != null) '${recipe.calories} kcal',
                    ].join(' · '),
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
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

class RecipeScreen extends StatefulWidget {
  const RecipeScreen({super.key, required this.recipeId});
  final String recipeId;

  @override
  State<RecipeScreen> createState() => _RecipeScreenState();
}

class _RecipeScreenState extends State<RecipeScreen> {
  bool? _favorite;

  Future<(Recipe?, bool)> _load() async {
    final results = await Future.wait([Api.instance.recipe(widget.recipeId), Api.instance.favoriteIds('receita')]);
    return (results[0] as Recipe?, (results[1] as Set<String>).contains(widget.recipeId));
  }

  Future<void> _toggle() async {
    final value = !(_favorite ?? false);
    setState(() => _favorite = value);
    try {
      await Api.instance.setFavorite('receita', widget.recipeId, value);
    } catch (_) {
      if (mounted) setState(() => _favorite = !value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsyncView<(Recipe?, bool)>(
        load: _load,
        builder: (context, data, _) {
          final (recipe, fav) = data;
          _favorite ??= fav;
          if (recipe == null) {
            return Scaffold(
              appBar: AppBar(),
              body: const MessageView(icon: Icons.search_off, title: 'Receita não encontrada'),
            );
          }
          final locked = !recipe.isFree && !AppState.instance.isSubscriber;
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 240,
                pinned: true,
                actions: [
                  IconButton(icon: Icon(_favorite! ? Icons.favorite : Icons.favorite_border), onPressed: _toggle),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: NetImage(recipe.imageUrl, radius: 0, icon: Icons.restaurant),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.all(20),
                sliver: SliverList.list(
                  children: [
                    Text(recipe.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        if (recipe.mealType != null) Pill(mealLabels[recipe.mealType] ?? recipe.mealType!),
                        if (recipe.prepMinutes != null) Pill('${recipe.prepMinutes} min', icon: Icons.timer_outlined),
                      ],
                    ),
                    if (recipe.description != null) ...[const SizedBox(height: 12), Text(recipe.description!)],
                    const SizedBox(height: 16),
                    if (recipe.calories != null)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _Macro('Calorias', '${recipe.calories}', 'kcal'),
                              _Macro('Proteína', _g(recipe.proteinG), 'g'),
                              _Macro('Carboidrato', _g(recipe.carbsG), 'g'),
                              _Macro('Gordura', _g(recipe.fatG), 'g'),
                            ],
                          ),
                        ),
                      ),
                    if (locked) ...[
                      const SizedBox(height: 20),
                      MessageViewCard(
                        icon: Icons.lock_outline,
                        title: 'Modo de preparo exclusivo para assinantes',
                        action: FilledButton(
                          onPressed: () => context.push('/assinatura'),
                          child: const Text('Saiba mais'),
                        ),
                      ),
                    ] else ...[
                      const SectionTitle('Ingredientes'),
                      for (final item in recipe.ingredients)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('•  '),
                              Expanded(child: Text(item)),
                            ],
                          ),
                        ),
                      const SectionTitle('Modo de preparo'),
                      for (final (i, s) in recipe.steps.indexed)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(radius: 12, child: Text('${i + 1}', style: const TextStyle(fontSize: 12))),
                              const SizedBox(width: 10),
                              Expanded(child: Text(s, style: const TextStyle(height: 1.4))),
                            ],
                          ),
                        ),
                    ],
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  String _g(double? v) => v == null ? '–' : v.toStringAsFixed(v % 1 == 0 ? 0 : 1);
}

class _Macro extends StatelessWidget {
  const _Macro(this.label, this.value, this.unit);
  final String label;
  final String value;
  final String unit;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$value$unit', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
      ],
    );
  }
}

class _MealPlansTab extends StatelessWidget {
  const _MealPlansTab();

  @override
  Widget build(BuildContext context) {
    if (!AppState.instance.isSubscriber) {
      return MessageView(
        icon: Icons.menu_book_outlined,
        title: 'Cardápios semanais para assinantes',
        message: 'Planos completos de refeições, montados para o seu objetivo.',
        action: FilledButton(onPressed: () => context.push('/assinatura'), child: const Text('Saiba mais')),
      );
    }
    return AsyncView<List<MealPlan>>(
      load: Api.instance.mealPlans,
      builder: (context, plans, _) {
        if (plans.isEmpty) return const MessageView(icon: Icons.menu_book_outlined, title: 'Novos cardápios em breve');
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: plans.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (context, i) {
            final p = plans[i];
            return Card(
              child: ListTile(
                contentPadding: const EdgeInsets.all(14),
                leading: const CircleAvatar(child: Icon(Icons.menu_book)),
                title: Text(p.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text(
                  [
                    if (p.dailyCalories != null) '${p.dailyCalories} kcal/dia',
                    if (p.description != null) p.description!,
                  ].join(' · '),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/cardapios/${p.id}'),
              ),
            );
          },
        );
      },
    );
  }
}

class MealPlanScreen extends StatelessWidget {
  const MealPlanScreen({super.key, required this.planId});
  final String planId;

  static const _days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now().weekday; // 1 = segunda
    return DefaultTabController(
      length: 7,
      initialIndex: today - 1,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Cardápio'),
          bottom: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: [for (final d in _days) Tab(text: d)],
          ),
        ),
        body: AsyncView<MealPlan?>(
          load: () => Api.instance.mealPlan(planId),
          builder: (context, plan, _) {
            if (plan == null) {
              return const MessageView(icon: Icons.lock_outline, title: 'Cardápio disponível para assinantes');
            }
            final order = mealLabels.keys.toList();
            return TabBarView(
              children: [
                for (var day = 1; day <= 7; day++)
                  Builder(
                    builder: (context) {
                      final items = plan.items.where((it) => it.dayOfWeek == day).toList()
                        ..sort((a, b) => order.indexOf(a.mealType).compareTo(order.indexOf(b.mealType)));
                      if (items.isEmpty) {
                        return const MessageView(icon: Icons.free_breakfast_outlined, title: 'Dia livre');
                      }
                      return ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          for (final it in items)
                            Card(
                              margin: const EdgeInsets.only(bottom: 10),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(12),
                                leading: SizedBox(
                                  width: 56,
                                  child: NetImage(it.recipe?.imageUrl, height: 56, radius: 12, icon: Icons.restaurant),
                                ),
                                title: Text(
                                  mealLabels[it.mealType] ?? it.mealType,
                                  style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.primary),
                                ),
                                subtitle: Text(
                                  it.recipe?.title ?? it.description ?? '',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black87,
                                  ),
                                ),
                                trailing: it.recipe == null ? null : const Icon(Icons.chevron_right),
                                onTap: it.recipe == null ? null : () => context.push('/receitas/${it.recipe!.id}'),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}
