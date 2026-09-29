import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app_state.dart';
import '../../config.dart';
import '../../services/firebase_services.dart';
import '../../services/purchases_service.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Assinatura dentro do app: App Store no iPhone, Google Play no Android (via RevenueCat).
/// Mostra as informações exigidas pelas lojas para assinaturas com renovação automática:
/// nome, duração e preço de cada plano, renovação, como cancelar, termos e privacidade,
/// além do botão "Restaurar compras".
class PaywallScreen extends StatefulWidget {
  const PaywallScreen({super.key});

  @override
  State<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends State<PaywallScreen> {
  static const _benefits = [
    (Icons.fitness_center, 'Todos os treinos com vídeo', 'Programas completos para cada objetivo e nível.'),
    (Icons.menu_book, 'Cardápios semanais', 'Refeições planejadas com receitas simples.'),
    (Icons.restaurant, 'Receitas completas', 'Ingredientes, preparo e macronutrientes.'),
    (Icons.emoji_events, 'Desafios exclusivos', 'Metas diárias para manter a constância.'),
  ];

  List<Package>? _packages;
  Package? _selected;
  String? _loadError;
  bool _busy = false;

  String get _storeName => defaultTargetPlatform == TargetPlatform.iOS ? 'App Store' : 'Google Play';

  @override
  void initState() {
    super.initState();
    _load();
    FirebaseServices.logEvent('paywall_view');
  }

  Future<void> _load() async {
    setState(() => _loadError = null);
    try {
      final list = await PurchasesService.packages();
      if (!mounted) return;
      setState(() {
        _packages = list;
        _selected = list.isEmpty ? null : list.first;
      });
    } catch (e) {
      if (mounted) setState(() => _loadError = 'Não foi possível carregar os planos da $_storeName.');
    }
  }

  Future<void> _buy() async {
    final pkg = _selected;
    if (pkg == null) return;
    setState(() => _busy = true);
    try {
      final outcome = await PurchasesService.buy(pkg);
      await AppState.instance.refresh();
      if (!mounted) return;
      switch (outcome) {
        case PurchaseOutcome.success:
          FirebaseServices.logEvent('purchase', {'product': pkg.storeProduct.identifier});
          showSnack(context, 'Bem-vinda ao Premium! 🎉');
          Navigator.of(context).maybePop();
        case PurchaseOutcome.pending:
          showSnack(context, 'Pagamento pendente. O acesso será liberado assim que a loja confirmar.');
        case PurchaseOutcome.cancelled:
        case PurchaseOutcome.notEntitled:
          break;
      }
    } catch (e) {
      if (mounted) showSnack(context, PurchasesService.errorMessage(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _restore() async {
    setState(() => _busy = true);
    try {
      final outcome = await PurchasesService.restore();
      await AppState.instance.refresh();
      if (!mounted) return;
      final ok = outcome == PurchaseOutcome.success || AppState.instance.isSubscriber;
      showSnack(context, ok ? 'Assinatura restaurada!' : 'Nenhuma assinatura encontrada nesta conta da $_storeName.');
    } catch (e) {
      if (mounted) showSnack(context, PurchasesService.errorMessage(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: AppBar(),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) => ListView(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
          children: [
            const Icon(Icons.workspace_premium, size: 60, color: AppColors.primary),
            const SizedBox(height: 8),
            Text(
              state.isSubscriber ? 'Você já é assinante!' : '${AppConfig.appName} Premium',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 20),
            for (final (icon, title, text) in _benefits)
              Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                      child: Icon(icon, color: AppColors.primary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
                          Text(text, style: TextStyle(color: Colors.grey.shade700)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 8),
            if (!state.isSubscriber) ..._purchaseSection(),
          ],
        ),
      ),
    );
  }

  List<Widget> _purchaseSection() {
    if (!PurchasesService.enabled && PurchasesService.demoPackages == null) {
      return [
        const Text('Compras indisponíveis nesta versão (RevenueCat não configurado).', textAlign: TextAlign.center),
      ];
    }
    if (_loadError != null) {
      return [
        Text(_loadError!, textAlign: TextAlign.center),
        const SizedBox(height: 12),
        OutlinedButton(onPressed: _load, child: const Text('Tentar de novo')),
      ];
    }
    if (_packages == null) return const [Center(child: CircularProgressIndicator())];
    if (_packages!.isEmpty) {
      return [const Text('Nenhum plano disponível no momento.', textAlign: TextAlign.center)];
    }

    final selected = _selected!;
    return [
      for (final p in _packages!)
        _PlanTile(package: p, selected: p == selected, onTap: () => setState(() => _selected = p)),
      const SizedBox(height: 12),
      FilledButton(
        onPressed: _busy ? null : _buy,
        child: _busy
            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))
            : Text(_hasTrial(selected) ? 'Começar teste grátis' : 'Assinar'),
      ),
      const SizedBox(height: 4),
      TextButton(onPressed: _busy ? null : _restore, child: const Text('Restaurar compras')),
      const SizedBox(height: 8),
      Text(
        '${_planDescription(selected)} '
        'O pagamento é cobrado na sua conta da $_storeName na confirmação da compra. '
        'A assinatura é renovada automaticamente pelo mesmo valor e período, a menos que seja cancelada '
        'pelo menos 24 horas antes do fim do período atual. Você pode gerenciar e cancelar a qualquer momento '
        'nas configurações da sua conta da $_storeName.',
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
      ),
      const SizedBox(height: 6),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TextButton(
            onPressed: () => launchUrl(Uri.parse(AppConfig.termsUrl)),
            child: const Text('Termos de uso', style: TextStyle(fontSize: 12)),
          ),
          const Text('·'),
          TextButton(
            onPressed: () => launchUrl(Uri.parse(AppConfig.privacyUrl)),
            child: const Text('Privacidade', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    ];
  }

  static bool _hasTrial(Package p) {
    final intro = p.storeProduct.introductoryPrice;
    return intro != null && intro.price == 0;
  }

  static String _planDescription(Package p) {
    final intro = p.storeProduct.introductoryPrice;
    final base = '${periodLabel(p)}: ${p.storeProduct.priceString}.';
    if (intro != null && intro.price == 0) {
      return '$base Teste grátis de ${_introLength(intro)}; depois, cobrança de ${p.storeProduct.priceString}.';
    }
    return base;
  }

  static String _introLength(IntroductoryPrice intro) {
    final n = intro.periodNumberOfUnits * (intro.cycles == 0 ? 1 : intro.cycles);
    return switch (intro.periodUnit) {
      PeriodUnit.day => '$n ${n == 1 ? 'dia' : 'dias'}',
      PeriodUnit.week => '$n ${n == 1 ? 'semana' : 'semanas'}',
      PeriodUnit.month => '$n ${n == 1 ? 'mês' : 'meses'}',
      PeriodUnit.year => '$n ${n == 1 ? 'ano' : 'anos'}',
      _ => intro.period,
    };
  }
}

String periodLabel(Package p) => switch (p.packageType) {
  PackageType.annual => 'Plano anual',
  PackageType.sixMonth => 'Plano semestral',
  PackageType.threeMonth => 'Plano trimestral',
  PackageType.twoMonth => 'Plano bimestral',
  PackageType.monthly => 'Plano mensal',
  PackageType.weekly => 'Plano semanal',
  PackageType.lifetime => 'Acesso vitalício',
  _ => p.storeProduct.title,
};

class _PlanTile extends StatelessWidget {
  const _PlanTile({required this.package, required this.selected, required this.onTap});
  final Package package;
  final bool selected;
  final VoidCallback onTap;

  String? get _monthlyEquivalent {
    final product = package.storeProduct;
    final months = switch (package.packageType) {
      PackageType.annual => 12,
      PackageType.sixMonth => 6,
      PackageType.threeMonth => 3,
      _ => 0,
    };
    if (months == 0) return null;
    final perMonth = product.price / months;
    return '${product.currencyCode == 'BRL' ? 'R\$' : product.currencyCode} '
        '${perMonth.toStringAsFixed(2).replaceAll('.', ',')}/mês';
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final intro = package.storeProduct.introductoryPrice;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: selected ? scheme.primaryContainer : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: selected ? scheme.primary : Colors.grey.shade300, width: selected ? 2 : 1),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(selected ? Icons.radio_button_checked : Icons.radio_button_off, color: scheme.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(periodLabel(package), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                      if (intro != null && intro.price == 0)
                        const Text('Com teste grátis', style: TextStyle(color: AppColors.success, fontSize: 13)),
                      if (_monthlyEquivalent != null)
                        Text(_monthlyEquivalent!, style: TextStyle(color: Colors.grey.shade700, fontSize: 13)),
                    ],
                  ),
                ),
                Text(
                  package.storeProduct.priceString,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
