## Visão geral

São 10 mudanças simultâneas no site. Algumas são triviais (texto, ordem de menu), outras envolvem download de imagens externas e nova seção. Antes de executar, preciso confirmar 3 pontos críticos que mudam o resultado final.

---

## ⚠️ Decisões que preciso confirmar antes

### A. Imagens da ZEC e Marzocchi (itens 6 e 7)
Você pediu "imagens profissionais de alta qualidade do site da ZEC" e "melhor foco/definição das bombas Marzocchi". Eu **não posso baixar imagens diretamente dos sites oficiais** sem risco de violar direitos de uso (são imagens protegidas dos fabricantes). Opções:

1. **Você envia as imagens** (ideal) — me mande os arquivos via upload e eu aplico
2. **Eu gero imagens profissionais via IA** com base nas categorias (mangueiras amarelas/vermelhas/azuis/verdes, bombas de engrenagens) — não serão as fotos reais da ZEC/Marzocchi, mas são de alta qualidade e livres
3. **Mantenho as imagens atuais** e só reorganizo a estrutura em 4 blocos coloridos

### B. Soluções como menu dropdown (item 2)
"Soluções englobando Produtos, Serviços, Treinamentos com sutil indicação visual" — você quer:
1. Um **dropdown** que abre ao passar o mouse com as 3 sub-abas, OU
2. Um item "Soluções" com um pequeno chevron `▾` que apenas leva à seção Produtos, OU
3. Criar uma **nova página `/solucoes`** que agrupa as 3 seções

### C. Botão flutuante de WhatsApp + remoção dos CTAs do topo (item 4)
Você quer remover "Falar com Especialista" e "Ver Soluções" **do header** (canto superior direito) e **do hero**? Ou só do hero, mantendo no header?

---

## Plano de execução (após confirmações)

### 1. Marca "Comex10" (junto)
- Substituir todas as ocorrências de "COMEX 10" e "Comex 10" por "Comex10" em todos os componentes, metadados, sitemap, alt texts.

### 2. Header
- Reordenar menu: Quem Somos · Soluções (▾ Produtos, Serviços, Treinamentos) · Segmentos · Parceiros · Blog · Contato
- Reincluir link do Blog (você havia removido antes — confirma reinclusão?)
- Tipografia "Comex10" no logo (caso queira substituir a imagem do logo por texto estilizado em Space Grotesk; ou manter o logo PNG atual)
- Ícones sociais movidos para a extremidade direita
- Fundo branco já está aplicado; apenas garantir consistência

### 3. Copy do Hero
- Trocar parágrafo pelo texto fornecido
- Manter/ajustar o headline ("Do problema à solução")?

### 4. CTAs e WhatsApp
- Remover os 2 botões do hero (conforme confirmação B)
- Adicionar `WhatsAppFloat.tsx` fixo bottom-right com link `wa.me/5511914900404`
- Reescrever CTAs finais (final de seções e Contato) com tom de crescimento: "Solicite agora", "Aumente a produtividade da sua operação", etc.

### 5. Parceiros e Equipamentos
- Aumentar `max-h` dos logos na seção Partners (especialmente Transfluid → max-h-16)
- Em Products → categoria Equipamentos: separar os 3 blocos Uniflex em uma fileira, e Transfluid + Held centralizados abaixo

### 6. Seção ZEC (depende de A)
- Texto introdutório explicando a linha ZEC
- 4 blocos coloridos: Hidráulica (amarelo `#F4C430`), Alta Pressão (vermelho `#DC2626`), Indústria (azul `#2563EB`), Água/Agro (verde `#16A34A`)
- Imagens conforme decisão A

### 7. Bombas Marzocchi (depende de A)
- Trocar 3 imagens atuais conforme decisão A

### 8. Serviços e Treinamentos
- **Serviços**: manter apenas Suporte Técnico Especializado, Reposição de Peças, Testes, Adequação NR12. Remover "Oficina do Futuro" e "Suporte Contínuo"
- **Treinamentos**: reduzir texto + adicionar bloco "Próximas Turmas" (ex: Turma Colômbia — data?)
  - **Pergunta**: você tem datas/cidades das próximas turmas internacionais ou coloco placeholder "Turma Colômbia — 2026"?

### 9. Nova seção Certificados
- Criar componente `Certificates.tsx` exibindo cards com certificados dos fornecedores (Marzocchi, etc.)
- **Pergunta**: você vai me enviar os PDFs/imagens dos certificados? Por enquanto, posso colocar cards com placeholder "Solicitar certificado" linkando para WhatsApp.

### 10. Responsividade / dobras
- Trocar `min-h-screen` rígido por `min-h-[100svh]` e remover `max-h` forçados
- Auditar Hero, Segments, Products para evitar corte em notebooks 768–900px de altura
- Adicionar `py-` adaptativo

---

## Resumo das perguntas

1. **Imagens ZEC/Marzocchi**: enviar você, gerar via IA, ou manter atuais?
2. **"Soluções" no menu**: dropdown, item simples com chevron, ou nova página?
3. **CTAs do topo**: remover do header e do hero, ou só do hero?
4. **Blog**: reincluir o link no menu? (você pediu para remover antes)
5. **Próximas turmas**: tem dados reais ou uso placeholder?
6. **Certificados**: tem arquivos para enviar ou uso cards "solicitar"?

Posso seguir com os itens que não dependem de respostas (1, 3, 5, 8, 10) em paralelo enquanto você confirma os demais — me diga se quer assim ou se prefere responder tudo antes.