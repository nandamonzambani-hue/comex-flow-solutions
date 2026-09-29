import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app_state.dart';
import '../../config.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Tela de benefícios. No iOS (e no Android, salvo configuração) ela NÃO leva a um
/// checkout externo — ver AppConfig.showExternalPurchaseLink. A aluna que assina pelo
/// site entra com a mesma conta e o acesso é liberado automaticamente.
class PaywallScreen extends StatelessWidget {
  const PaywallScreen({super.key});

  static const _benefits = [
    (Icons.fitness_center, 'Todos os treinos com vídeo', 'Programas completos para cada objetivo e nível.'),
    (Icons.menu_book, 'Cardápios semanais', 'Refeições planejadas com receitas simples.'),
    (Icons.restaurant, 'Receitas completas', 'Ingredientes, preparo e macronutrientes.'),
    (Icons.emoji_events, 'Desafios exclusivos', 'Metas diárias para manter a constância.'),
  ];

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: AppBar(),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) => ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const Icon(Icons.workspace_premium, size: 64, color: AppColors.primary),
            const SizedBox(height: 12),
            Text(
              state.isSubscriber ? 'Você já é assinante!' : '${AppConfig.appName} Premium',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 24),
            for (final (icon, title, text) in _benefits)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
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
            const SizedBox(height: 16),
            if (!state.isSubscriber) ...[
              if (AppConfig.showExternalPurchaseLink)
                FilledButton(
                  onPressed: () =>
                      launchUrl(Uri.parse('${AppConfig.siteUrl}/assinar'), mode: LaunchMode.externalApplication),
                  child: const Text('Ver planos'),
                )
              else
                Text(
                  'Já assinou? Toque em "Atualizar" para liberar o acesso.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade700),
                ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.refresh),
                label: const Text('Atualizar'),
                onPressed: () async {
                  await state.refresh();
                  if (context.mounted) {
                    showSnack(
                      context,
                      state.isSubscriber ? 'Acesso liberado!' : 'Nenhuma assinatura ativa encontrada.',
                    );
                  }
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
