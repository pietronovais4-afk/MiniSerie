# DRAMIX — Plataforma de Streaming de Minisséries Verticais

Plataforma profissional de streaming de minisséries verticais inspirada na identidade visual moderna do **VibeShort**, priorizando a experiência mobile-first, interface cinematográfica, navegação rápida por abas inferiores e mecânicas completas de retenção e monetização (check-in de 7 dias, moedas, passe VIP e episódios bloqueados com 3 opções).

---

## 📁 Estrutura de Arquivos

```
dramix/
├── index.html                           # Interface mobile-first cinematográfica com Tailwind CSS
├── app.js                               # Controlador principal de rotas, navegação inferior e cabeçalho
├── server.ps1                           # Servidor HTTP local em PowerShell (Porta 8080)
├── README.md                            # Documentação técnica e guia de uso
│
├── data/
│   ├── catalog.js                       # Catálogo cinematográfico de minisséries verticais
│   └── local-store.js                   # Gerenciador de estado local reativo (moedas, check-in, passes VIP, favoritos)
│
├── db/
│   └── database.js                      # Banco de dados v4 com regras de monetização e 5 eps grátis
│
├── api/
│   └── backend-service.js               # Serviços de validação de acesso, paywall e sessões
│
├── components/
│   ├── checkin-modal.js                 # Modal de Check-in Diário de 7 Dias (20, 60, 20, 25, 30, 30, 100)
│   ├── locked-episode-modal.js          # Modal de Episódio Bloqueado com 3 Opções de Desbloqueio
│   ├── pass-modal.js                    # Modal de Passe Semanal e Passe Anual PRO
│   ├── player.js                        # Player vertical 9:16 com controles, retenção e bloqueio inteligente
│   ├── rewarded-ad-modal.js             # Modal de anúncio em vídeo demonstrativo
│   └── checkout-modal.js                # Modal de pagamento
│
└── views/
    ├── discover.js                      # Tela Principal Descobrir (Séries Populares, Novo, TOP, Catálogo)
    ├── shorts.js                        # Feed Vertical de Vídeos Curtos (Shorts em tela cheia)
    ├── rewards.js                       # Central de Recompensas e Missões Diárias (Aba Prêmio)
    ├── favorites.js                     # Lista de Favoritos e Salvos do Usuário (Aba Minha Lista)
    ├── profile.js                       # Perfil do Usuário com Saldo, VIP e Preferências (Aba Perfil)
    ├── coin-store.js                    # Loja de Moedas com pacotes e bônus progressivos
    ├── series-details.js                # Ficha da Minissérie com Episódios 1-5 grátis e Ep 6+ bloqueado
    ├── home.js                          # Visão geral cinematográfica e fileiras
    ├── subscription.js                  # Planos e assinaturas complementares
    └── owner-panel.js                   # Painel de Administração e Gestão de Produções
```

---

## 🎨 1. Identidade Visual (VibeShort Experience)

- **Paleta de Cores Cinematográfica:** Fundo preto e azul-escuro profundo (`#060810`, `#0B0E1B`), superfícies em `#121626` e gradientes em violeta, roxo e fúcsia (`from-violet-600 via-purple-600 to-fuchsia-600`).
- **Zero Emojis:** Ícones vetoriais SVG minimalistas para categorias, menus e catálogos.
- **Formato Vertical:** Pôsteres verticais na proporção 9:16 com cantos arredondados, badges discretas ("5 Eps Grátis", "VIP", "HD") e títulos legíveis.
- **Design Mobile-First:** Perfeitamente adaptado para celulares com barra inferior fixa e navegação por toque.

---

## 📱 2. Barra de Navegação Inferior (5 Abas Fixas)

1. **Descobrir:** Tela principal com barra superior (Logo DRAMIX, Moedas, Bônus, Busca), filtros horizontais de categoria (*Séries Populares*, *Novo*, *TOP*, *Catálogo*) e 5 seções dinâmicas de pôsteres verticais.
2. **Shorts:** Feed vertical estilo TikTok/Reels com reprodução contínua, botões laterais de interação (curtir, adicionar à lista, compartilhar) e botão para *"Assistir Minissérie Completa"*.
3. **Prêmio:** Hub central de recompensas com saldo de moedas, card interativo de Check-in Diário de 7 Dias, missões diárias com botões de resgate e destaque do Passe VIP.
4. **Minha Lista:** Coleção de minisséries favoritadas pelo usuário com cards verticais, atalho rápido para assistir, botão de remoção e recomendações quando vazia.
5. **Perfil:** Painel do usuário com saldo de moedas, status VIP, atalhos rápidos para a Loja de Moedas e Central de Recompensas, e opções de preferências.

---

## 🎁 3. Sistema de Recompensa Diária (Check-in de 7 Dias)

- **Progressão dos 7 Dias:**
  - Dia 1: +20 moedas
  - Dia 2: +60 moedas
  - Dia 3: +20 moedas
  - Dia 4: +25 moedas
  - Dia 5: +30 moedas
  - Dia 6: +30 moedas
  - Dia 7: +100 moedas
- **Estados Visuais Clifificados:**
  - *Resgatado:* Checkmark violeta e indicador de concluído.
  - *Disponível Hoje:* Efeito pulsante, anel de destaque e botão ativo de resgate.
  - *Futuro:* Indicador de cadeado e quantia a ser liberada no próximo dia.
- **Funcionalidades:**
  - Botão de ativação de lembrete diário (*"Lembre-me"*).
  - Atualização instantânea e reativa do saldo no topo da tela.

---

## 🔒 4. Regras de Acesso e Modal de Episódio Bloqueado

- **Episódios 1 a 5:** 100% gratuitos para todas as produções.
- **Episódios 6 em diante:** Bloqueados por padrão com indicação de cadeado e custo de 30 moedas.
- **Modal de Desbloqueio (3 Opções Reais):**
  1. **Desbloquear agora (30 moedas):** Desbloqueia o episódio permanentemente se o usuário tiver saldo suficiente. Se o saldo for insuficiente, oferece redirecionamento automático para a Loja de Moedas.
  2. **Desbloqueio por anúncio:** Assista a um vídeo curto de 5 segundos para liberar o episódio. Possui controle de limite diário (*"Já assistido hoje X/10"*).
  3. **Desbloquear todos os episódios:** Abre o modal de assinatura do Passe Semanal Pro (R$ 29,90) ou Passe Anual Pro (R$ 299,90) para liberação ilimitada de todo o catálogo.

---

## 💰 5. Loja de Moedas (Coin Store)

- Saldo do usuário exibido no topo com link direto para a Central de Recompensas.
- Pacotes com bônus progressivos:
  - **Básico:** 100 moedas — R$ 4,90
  - **Popular:** 300 + 30 bônus — R$ 12,90
  - **Premium:** 700 + 100 bônus — R$ 24,90
  - **Pro Especial:** 1.000 + 100 bônus — R$ 59,90
  - **Super Fan (Mais Popular):** 1.500 + 300 bônus — R$ 99,90
  - **Mega:** 2.000 + 600 bônus — R$ 129,90
  - **Ultimate (Melhor Valor):** 2.500 + 1.250 bônus — R$ 149,90
  - **VIP Master:** 3.500 + 800 bônus — R$ 99,90
- Simulação funcional de compra com crédito imediato no saldo local e notificação visual.

---

## 🚀 Como Executar

### Opção 1 — Servidor Local Integrado (Recomendado)
Execute no PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Acesse no navegador:
```
http://localhost:8080/
```

### Opção 2 — Execução Direta no Navegador
Abra diretamente o arquivo `index.html` em qualquer navegador moderno.
