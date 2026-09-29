import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app_state.dart';
import '../../config.dart';
import '../../models/models.dart';
import '../../services/api.dart';
import '../../services/firebase_services.dart';
import '../../widgets/common.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    await FirebaseServices.unregisterPush().catchError((_) {});
    await Supabase.instance.client.auth.signOut();
  }

  static String _storeName(String source) => source == 'play_store' ? 'Google Play' : 'App Store';

  /// Assinaturas das lojas só podem ser gerenciadas/canceladas na própria loja.
  static Future<void> _manageStoreSubscription(Subscription sub) async {
    final url = sub.source == 'play_store'
        ? 'https://play.google.com/store/account/subscriptions?package=${AppConfig.androidPackage}'
              '${sub.productId == null ? '' : '&sku=${Uri.encodeComponent(sub.productId!.split(':').first)}'}'
        : 'https://apps.apple.com/account/subscriptions';
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  Future<void> _deleteAccount(BuildContext context) async {
    final sub = AppState.instance.subscription;
    final storeActive = sub.isActive && sub.fromStore;
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Excluir conta?'),
        content: Text(
          'Todos os seus dados (medidas, histórico, favoritos) serão apagados permanentemente. '
          'Essa ação não pode ser desfeita.'
          '${storeActive
              ? '\n\nAtenção: sua assinatura foi feita pela ${_storeName(sub.source)} e NÃO é cancelada '
                    'ao excluir a conta. Cancele antes em "Gerenciar assinatura" para não ser cobrada.'
              : sub.isActive
              ? '\n\nSua assinatura será cancelada.'
              : ''}',
        ),
        actions: [
          if (storeActive)
            TextButton(
              onPressed: () {
                Navigator.pop(c, false);
                _manageStoreSubscription(sub);
              },
              child: const Text('Gerenciar assinatura'),
            ),
          TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancelar')),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await FirebaseServices.unregisterPush().catchError((_) {});
      await Api.instance.deleteAccount();
    } catch (_) {
      if (context.mounted) showSnack(context, 'Não foi possível excluir agora. Tente novamente.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final p = state.profile;
          final sub = state.subscription;
          final email = Supabase.instance.client.auth.currentUser?.email ?? '';
          return RefreshIndicator(
            onRefresh: state.refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      radius: 28,
                      child: Text(
                        (p?.firstName.isNotEmpty ?? false) ? p!.firstName[0].toUpperCase() : '?',
                        style: const TextStyle(fontSize: 22),
                      ),
                    ),
                    title: Text(p?.fullName ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    subtitle: Text(email),
                    trailing: IconButton(
                      icon: const Icon(Icons.edit_outlined),
                      onPressed: () => context.push('/perfil/editar'),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.flag_outlined),
                        title: const Text('Objetivo'),
                        trailing: Text(goalLabels[p?.goal] ?? '–'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.signal_cellular_alt),
                        title: const Text('Nível'),
                        trailing: Text(levelLabels[p?.level] ?? '–'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.calendar_today_outlined),
                        title: const Text('Treinos por semana'),
                        trailing: Text('${p?.trainingDaysPerWeek ?? '–'}'),
                      ),
                    ],
                  ),
                ),
                const SectionTitle('Assinatura'),
                Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Icon(
                      sub.isActive ? Icons.workspace_premium : Icons.lock_outline,
                      color: sub.isActive ? Colors.amber.shade700 : null,
                    ),
                    title: Text(
                      sub.isActive ? 'Assinatura ativa' : 'Plano gratuito',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(_subscriptionText(sub)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      if (!sub.isActive) {
                        context.push('/assinatura');
                      } else if (sub.fromStore) {
                        _manageStoreSubscription(sub);
                      } else {
                        showSnack(
                          context,
                          'Sua assinatura foi feita pelo site. Gerencie em ${AppConfig.siteUrl}/conta.',
                        );
                      }
                    },
                  ),
                ),
                const SectionTitle('Mais'),
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.history),
                        title: const Text('Histórico de treinos'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/historico'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.emoji_events_outlined),
                        title: const Text('Desafios'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/desafios'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.privacy_tip_outlined),
                        title: const Text('Privacidade e termos'),
                        trailing: const Icon(Icons.open_in_new, size: 18),
                        onTap: () => launchUrl(Uri.parse('${AppConfig.siteUrl}/privacidade')),
                      ),
                      ListTile(
                        leading: const Icon(Icons.logout),
                        title: const Text('Sair'),
                        onTap: () => _logout(context),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                  onPressed: () => _deleteAccount(context),
                  child: const Text('Excluir minha conta'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _subscriptionText(Subscription s) {
    if (!s.isActive) return 'Toque para conhecer os benefícios.';
    final end = s.currentPeriodEnd == null ? null : DateFormat('dd/MM/yyyy').format(s.currentPeriodEnd!.toLocal());
    if (s.billingIssue) return 'Problema na cobrança — atualize o pagamento na ${_storeName(s.source)}';
    if (s.currentPeriodEnd == null) return 'Acesso liberado';
    if (s.status == 'trialing') return 'Período de teste${end == null ? '' : ' até $end'}';
    if (s.cancelAtPeriodEnd) return 'Cancelada — acesso até $end';
    return end == null ? 'Renovação automática' : 'Renova em $end';
  }
}

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final p = AppState.instance.profile!;
  late final _name = TextEditingController(text: p.fullName);
  late final _height = TextEditingController(text: p.heightCm?.toStringAsFixed(0) ?? '');
  late String? _goal = p.goal;
  late String _level = p.level;
  late int _days = p.trainingDaysPerWeek ?? 3;
  bool _busy = false;

  Future<void> _save() async {
    final height = double.tryParse(_height.text.replaceAll(',', '.'));
    if (_name.text.trim().isEmpty) return showSnack(context, 'Informe seu nome.');
    if (height != null && (height < 100 || height > 250)) return showSnack(context, 'Altura em cm (ex.: 165).');
    setState(() => _busy = true);
    try {
      await Api.instance.updateProfile({
        'full_name': _name.text.trim(),
        'height_cm': height,
        'goal': _goal,
        'level': _level,
        'training_days_per_week': _days,
      });
      await AppState.instance.refresh();
      if (mounted) context.pop();
    } catch (_) {
      if (mounted) showSnack(context, 'Não foi possível salvar.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Editar perfil')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _name,
            decoration: const InputDecoration(labelText: 'Nome'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _height,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Altura', suffixText: 'cm'),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _goal,
            decoration: const InputDecoration(labelText: 'Objetivo'),
            items: [for (final e in goalLabels.entries) DropdownMenuItem(value: e.key, child: Text(e.value))],
            onChanged: (v) => setState(() => _goal = v),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _level,
            decoration: const InputDecoration(labelText: 'Nível'),
            items: [for (final e in levelLabels.entries) DropdownMenuItem(value: e.key, child: Text(e.value))],
            onChanged: (v) => setState(() => _level = v ?? _level),
          ),
          const SizedBox(height: 16),
          Text('Treinos por semana: $_days'),
          Slider(
            value: _days.toDouble(),
            min: 1,
            max: 7,
            divisions: 6,
            onChanged: (v) => setState(() => _days = v.round()),
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: _busy ? null : _save, child: const Text('Salvar')),
        ],
      ),
    );
  }
}
