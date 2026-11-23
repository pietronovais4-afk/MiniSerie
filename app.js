/**
 * DRAMIX — Aplicação Principal, Roteador & Controlador Global
 * Implementa a navegação VibeShort completa:
 * - 5 abas inferiores fixas: Descobrir, Shorts, Prêmio, Minha Lista, Perfil
 * - Topo moderno com Logo, saldo de moedas, bônus de check-in e busca
 * - Modais reativos: Check-in 7 dias, Episódio Bloqueado (3 opções) e Passe Semanal/Anual Pro
 * - Navegação suave, sem necessidade de recarregar a página
 */

(function(root) {
  'use strict';

  class DramixApp {
    constructor() {
      this.api = root.dramixAPI;
      this.store = root.dramixStore;

      // Modais do Sistema
      this.player = new root.DramixPlayer(this.api);
      this.checkInModal = new root.DramixCheckInModal(this.store);
      this.lockedEpisodeModal = new root.DramixLockedEpisodeModal(this.store);
      this.passModal = new root.DramixPassModal(this.store);

      // Instâncias de visualizações
      this.views = {
        discover: new root.DramixDiscoverView(this.api, this.store),
        shorts: new root.DramixShortsView(this.api, this.store),
        rewards: new root.DramixRewardsView(this.store, this.api),
        favorites: new root.DramixFavoritesView(this.store, this.api),
        profile: new root.DramixProfileView(this.store, this.api),
        'coin-store': new root.DramixCoinStoreView(this.store, this.api),
        'series-details': new root.DramixSeriesDetailsView(this.api, this.store),
        home: new root.DramixDiscoverView(this.api, this.store) // alias
      };

      this.currentView = 'discover';
      this.currentViewParams = {};
    }

    init() {
      this.renderHeader();
      this.renderBottomNav();
      this.bindGlobalEvents();
      this.navigate('discover');
    }

    // ==================== CABEÇALHO SUPERIOR ELEGANTE ====================
    renderHeader() {
      const headerEl = document.getElementById('dramix-header');
      if (!headerEl) return;

      const coins = this.store.getCoins();
      const passInfo = this.store.getProPassInfo();

      headerEl.innerHTML = `
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <!-- Logo & Marca Principal -->
          <button id="nav-brand-logo" class="flex items-center gap-2.5 cursor-pointer text-left">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-violet-600/30">D</span>
            <span class="text-xl font-black tracking-wider text-white">DRAMIX</span>
          </button>

          <!-- Links de Navegação Desktop -->
          <nav class="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-300">
            <button class="nav-desktop-link px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer" data-view="discover">Descobrir</button>
            <button class="nav-desktop-link px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer" data-view="shorts">Shorts</button>
            <button class="nav-desktop-link px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer" data-view="rewards">Prêmio</button>
            <button class="nav-desktop-link px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer" data-view="favorites">Minha Lista</button>
            <button class="nav-desktop-link px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer" data-view="coin-store">Loja de Moedas</button>
          </nav>

          <!-- Ações do Topo: Moedas, Check-in & Passe VIP -->
          <div class="flex items-center gap-2.5 sm:gap-3">
            
            <!-- Saldo de Moedas com Atalho para Loja -->
            <button id="header-btn-coins" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm group">
              <span class="text-sm">🪙</span>
              <span class="text-xs font-black text-amber-300 group-hover:text-amber-200" id="header-coins-val">${coins}</span>
              <span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">+</span>
            </button>

            <!-- Bônus Diário -->
            <button id="header-btn-checkin" class="relative p-2 rounded-full bg-white/5 hover:bg-violet-600/20 border border-white/10 text-violet-300 transition-all cursor-pointer" title="Recompensa Diária">
              <svg class="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
              <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-fuchsia-500 animate-ping"></span>
              <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-fuchsia-500"></span>
            </button>

            <!-- Botão Passe VIP -->
            <button id="header-btn-pass" class="hidden sm:flex py-1.5 px-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black tracking-wide shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 items-center gap-1">
              <span>👑</span>
              <span>${passInfo.active ? 'VIP Ativo' : 'Passe VIP'}</span>
            </button>

            <!-- Avatar Rápido do Perfil -->
            <button id="header-btn-profile" class="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-violet-400 transition-all cursor-pointer flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover" />
            </button>

          </div>

        </div>
      `;

      this.bindHeaderEvents();
    }

    bindHeaderEvents() {
      const logo = document.getElementById('nav-brand-logo');
      if (logo) logo.onclick = () => this.navigate('discover');

      const coinsBtn = document.getElementById('header-btn-coins');
      if (coinsBtn) coinsBtn.onclick = () => this.navigate('coin-store');

      const checkInBtn = document.getElementById('header-btn-checkin');
      if (checkInBtn) checkInBtn.onclick = () => this.checkInModal.open();

      const passBtn = document.getElementById('header-btn-pass');
      if (passBtn) passBtn.onclick = () => this.passModal.open();

      const profileBtn = document.getElementById('header-btn-profile');
      if (profileBtn) profileBtn.onclick = () => this.navigate('profile');

      document.querySelectorAll('.nav-desktop-link').forEach(link => {
        link.onclick = () => this.navigate(link.dataset.view);
      });
    }

    // ==================== BARRA DE NAVEGAÇÃO INFERIOR (5 ITENS) ====================
    renderBottomNav() {
      let nav = document.getElementById('dramix-bottom-nav');
      if (!nav) {
        nav = document.createElement('nav');
        nav.id = 'dramix-bottom-nav';
        nav.className = 'fixed bottom-0 inset-x-0 z-40 bg-[#060810]/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl transition-all';
        document.body.appendChild(nav);
      }

      nav.innerHTML = `
        <div class="max-w-lg mx-auto h-16 px-2 flex items-center justify-around">
          
          <!-- 1. DESCOBRIR -->
          <button class="bottom-nav-item flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition-all ${this.currentView === 'discover' || this.currentView === 'home' ? 'text-violet-400 font-black scale-105' : 'text-gray-400 hover:text-gray-200 font-medium'}" data-view="discover">
            <svg class="w-5 h-5 ${this.currentView === 'discover' || this.currentView === 'home' ? 'text-violet-400' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
            <span class="text-[10px] tracking-tight">Descobrir</span>
            ${this.currentView === 'discover' || this.currentView === 'home' ? '<span class="w-1.5 h-1.5 rounded-full bg-violet-400 -mt-0.5"></span>' : ''}
          </button>

          <!-- 2. SHORTS -->
          <button class="bottom-nav-item flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition-all ${this.currentView === 'shorts' ? 'text-violet-400 font-black scale-105' : 'text-gray-400 hover:text-gray-200 font-medium'}" data-view="shorts">
            <svg class="w-5 h-5 ${this.currentView === 'shorts' ? 'text-violet-400' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-[10px] tracking-tight">Shorts</span>
            ${this.currentView === 'shorts' ? '<span class="w-1.5 h-1.5 rounded-full bg-violet-400 -mt-0.5"></span>' : ''}
          </button>

          <!-- 3. PRÊMIO -->
          <button class="bottom-nav-item flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition-all ${this.currentView === 'rewards' ? 'text-violet-400 font-black scale-105' : 'text-gray-400 hover:text-gray-200 font-medium'}" data-view="rewards">
            <svg class="w-5 h-5 ${this.currentView === 'rewards' ? 'text-violet-400' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
            <span class="text-[10px] tracking-tight">Prêmio</span>
            ${this.currentView === 'rewards' ? '<span class="w-1.5 h-1.5 rounded-full bg-violet-400 -mt-0.5"></span>' : ''}
          </button>

          <!-- 4. MINHA LISTA -->
          <button class="bottom-nav-item flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition-all ${this.currentView === 'favorites' ? 'text-violet-400 font-black scale-105' : 'text-gray-400 hover:text-gray-200 font-medium'}" data-view="favorites">
            <svg class="w-5 h-5 ${this.currentView === 'favorites' ? 'text-violet-400' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            <span class="text-[10px] tracking-tight">Minha Lista</span>
            ${this.currentView === 'favorites' ? '<span class="w-1.5 h-1.5 rounded-full bg-violet-400 -mt-0.5"></span>' : ''}
          </button>

          <!-- 5. PERFIL -->
          <button class="bottom-nav-item flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition-all ${this.currentView === 'profile' ? 'text-violet-400 font-black scale-105' : 'text-gray-400 hover:text-gray-200 font-medium'}" data-view="profile">
            <svg class="w-5 h-5 ${this.currentView === 'profile' ? 'text-violet-400' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span class="text-[10px] tracking-tight">Perfil</span>
            ${this.currentView === 'profile' ? '<span class="w-1.5 h-1.5 rounded-full bg-violet-400 -mt-0.5"></span>' : ''}
          </button>

        </div>
      `;

      nav.querySelectorAll('.bottom-nav-item').forEach(btn => {
        btn.onclick = () => this.navigate(btn.dataset.view);
      });
    }

    // ==================== ROTEAMENTO E NAVEGAÇÃO ====================
    navigate(viewName, params = {}) {
      this.currentView = viewName;
      this.currentViewParams = params;

      const mainContainer = document.getElementById('dramix-main-content');
      if (!mainContainer) return;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Atualiza destaques nas navbars
      this.renderBottomNav();
      this.renderHeader();

      switch (viewName) {
        case 'discover':
        case 'home':
          this.views.discover.render(mainContainer);
          break;
        case 'shorts':
          this.views.shorts.render(mainContainer);
          break;
        case 'rewards':
          this.views.rewards.render(mainContainer);
          break;
        case 'favorites':
          this.views.favorites.render(mainContainer);
          break;
        case 'profile':
          this.views.profile.render(mainContainer);
          break;
        case 'coin-store':
          this.views['coin-store'].render(mainContainer);
          break;
        case 'series-details':
          this.views['series-details'].render(mainContainer, params.seriesId);
          break;
        default:
          this.views.discover.render(mainContainer);
      }
    }

    // ==================== EVENTOS GLOBAIS DO SISTEMA ====================
    bindGlobalEvents() {
      // Navegação por evento
      window.addEventListener('dramix-navigate-view', (e) => {
        this.navigate(e.detail.view, e.detail);
      });

      // Reprodução de Episódio
      window.addEventListener('dramix-play-episode', (e) => {
        const { series, episodeNumber, startTimestamp } = e.detail;
        this.player.open(series, episodeNumber, startTimestamp || 0);
      });

      // Abertura da Tela de Episódio Bloqueado (3 opções)
      window.addEventListener('dramix-show-locked-modal', (e) => {
        const { series, episodeNumber } = e.detail;
        this.lockedEpisodeModal.show(series, episodeNumber, (unlockedSeries, unlockedEpNum) => {
          this.player.open(unlockedSeries, unlockedEpNum);
        });
      });

      // Abertura do Modal de Check-in (Recompensa Diária)
      window.addEventListener('dramix-open-checkin-modal', () => {
        this.checkInModal.open();
      });

      // Abertura do Modal de Passe Pro
      window.addEventListener('dramix-open-pass-modal', (e) => {
        this.passModal.open(e.detail);
      });

      // Abertura da Loja de Moedas
      window.addEventListener('dramix-open-coin-store', () => {
        this.navigate('coin-store');
      });

      // Atualizações de Moedas e Estado Local
      window.addEventListener('dramix-coins-changed', (e) => {
        const coinsVal = document.getElementById('header-coins-val');
        const topCoins = document.getElementById('discover-top-coins');
        const storeCoins = document.getElementById('store-coins-display');
        if (coinsVal) coinsVal.textContent = e.detail.coins;
        if (topCoins) topCoins.textContent = e.detail.coins;
        if (storeCoins) storeCoins.textContent = e.detail.coins;
      });

      window.addEventListener('dramix-store-changed', () => {
        this.renderHeader();
      });
    }
  }

  root.DramixApp = DramixApp;

  // Inicialização quando DOM estiver pronto
  window.addEventListener('DOMContentLoaded', () => {
    window.dramixInstance = new DramixApp();
    window.dramixInstance.init();
  });
})(typeof window !== 'undefined' ? window : global);
