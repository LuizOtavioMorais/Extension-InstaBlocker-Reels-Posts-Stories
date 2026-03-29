// ABERTURA DO CODIGO 
const api = typeof browser !== "undefined" ? browser : chrome;

(() => {
  'use strict';

  const TAG = '[OcultadorDeReels]';
  const ATTR_REEL_OCULTO = 'data-reel-oculto';
  const ATTR_POST_OCULTO = 'data-post-oculto';
  let quantidadeOcultada = 0;

  // ── Configuração padrão ────────────────────────────────────────────
  const DEFAULTS = {
    reels: false,
    posts: false,   // um falso objeto os {} guardam informaçoes
    stories: false,
  };

  let config = { ...DEFAULTS }; //default é sempre igual, config é onde vai ser alterado sem perder
  // o padrão

  // ── Persistência com chrome.storage ────────────────────────────────
  function salvarConfig() {
    if (api?.storage?.local) {
      api.storage.local.set({ ocultadorConfig: config }); // salva a configuraçao que eu defini
    }
  }

  function carregarConfig() {
    return new Promise((resolve) => {  // resolve é uma função que diz que deu certo,
      if (api?.storage?.local) {     //aqui temos uma promessa, se achar a config ele executa o resolve
        api.storage.local.get('ocultadorConfig', (result) => {
          if (result.ocultadorConfig) {
            config = { ...DEFAULTS, ...result.ocultadorConfig };
          }
          resolve();
        });
      } else {
        console.warn("⚠️ Arquivo de salvamento não encontrado, Utilizando configuração padrão (Extensão de Desabilitar Reels)");
        resolve();
      }
    });
  }

  // ── Aplicar classes no body conforme config ────────────────────────
  function aplicarClasses() {
    document.body.classList.toggle('ocultar-reels', config.reels); //se config.reels for true, ele ativa o ocultar
    document.body.classList.toggle('ocultar-posts', config.posts);
    document.body.classList.toggle('ocultar-stories', config.stories);

  }

  // ── Atualizar estado visual dos toggles ────────────────────────────
  function atualizarToggles() {
    const ids = {
      reels: 'toggle-reels',
      posts: 'toggle-posts', //pega a informaçao do banco de dados e exibe na tela
      stories: 'toggle-stories',
    };
    for (const [key, id] of Object.entries(ids)) {
      const input = document.getElementById(id);
      if (input) input.checked = config[key];
    }
  }

  // ── Criar o painel de controle ─────────────────────────────────────
  function criarPainel() {
    if (document.getElementById('ocultar-painel-controle')) return;

    const painel = document.createElement('div');
    painel.id = 'ocultar-painel-controle';

    // Botão de toggle do painel
    const btnToggle = document.createElement('button');
    btnToggle.id = 'ocultar-painel-toggle';
    btnToggle.title = 'Controles de ocultação';

    // SVG estático — usar template para parsing seguro
    const svgTemplate = document.createElement('template');
    svgTemplate.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    btnToggle.appendChild(svgTemplate.content.firstChild);
    painel.appendChild(btnToggle);

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'ocultar-painel-dropdown';

    const titulo = document.createElement('div');
    titulo.className = 'painel-titulo';
    titulo.textContent = 'Ocultar Apenas:';
    dropdown.appendChild(titulo);

    dropdown.appendChild(criarToggleElement('toggle-reels', '🎬 Reels / Botão Reels'));
    dropdown.appendChild(criarToggleElement('toggle-posts', '📷 Posts'));
    dropdown.appendChild(criarToggleElement('toggle-stories', '⏳ Stories'));

    painel.appendChild(dropdown); //botao de ligar e desligar 'id' 'texto'

    document.body.appendChild(painel);

    // Botão abre/fecha dropdown (btnToggle e dropdown já criados acima)

    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('aberto');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!painel.contains(e.target)) {
        dropdown.classList.remove('aberto');
      }
    });

    // Eventos dos toggles
    const mapa = {
      'toggle-reels': 'reels',       // esse atualiza o banco de dados apos o click (da uma funçao ao botao)
      'toggle-posts': 'posts',
      'toggle-stories': 'stories',
    };

    for (const [id, key] of Object.entries(mapa)) { //esse for fica de olho o tempo inteiro nas entradas em mapa para atualizar o banco
      document.getElementById(id).addEventListener('change', (e) => {
        config[key] = e.target.checked;
        aplicarClasses();
        salvarConfig();

        // Reels: processar ou restaurar conforme toggle
        if (key === 'reels') {
          if (config.reels) {
            processarFeed();
          } else {
            restaurarReels();
          }
        }

        // Posts: processar ou restaurar conforme toggle
        if (key === 'posts') {
          if (config.posts) {
            processarPosts();
          } else {
            restaurarPosts();
          }
        }
      });
    }

    atualizarToggles();
  }
  //botao padronizado que é chamado la em cima (agora retorna elemento DOM)
  function criarToggleElement(id, label) {
    const item = document.createElement('div');
    item.className = 'ocultar-item';

    const span = document.createElement('span');
    span.className = 'ocultar-item-label';
    span.textContent = label;
    item.appendChild(span);

    const switchLabel = document.createElement('label');
    switchLabel.className = 'ocultar-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    switchLabel.appendChild(input);

    const slider = document.createElement('span');
    slider.className = 'slider';
    switchLabel.appendChild(slider);

    item.appendChild(switchLabel);
    return item;
  }
  // ─── Detecção de Posts ──────────────────────────────────────────────

  // 1. Encontrar Posts
  function isPost(container) {
    if (!container) return false;

    // Se for identificado como Reel, não tratamos como "Post comum"
    if (isReel(container)) return false;

    //1. Achar imagem de post (URLs de CDN do Instagram)
    const imgPosts = container.querySelectorAll('img');
    for (const imgPost of imgPosts) {
      const src = imgPost.getAttribute('src') || '';
      // Imagens do Instagram usam scontent ou cdninstagram
      if (src.includes('scontent') || src.includes('cdninstagram') || src.includes('instagram')) {
        // Ignorar imagens muito pequenas (avatares, ícones)
        const w = imgPost.naturalWidth || imgPost.width || 0;
        if (w > 150) {
          console.log("Imagem de post encontrada:", src.substring(0, 80));
          return true;
        }
      }
    }
    return false;
  }


  // ── Detecção de Reels ──────────────────────────────────────────────
  function isReel(container) {
    if (!container) return false;

    // 1. Links para /reels/ ou /reel/
    const links = container.querySelectorAll('a[href]');
    for (const link of links) {
      if (/\/reels?\//i.test(link.getAttribute('href'))) {
        return true;
      }
    }

    // 2. SVG do ícone de Reels (aria-label)
    const svgs = container.querySelectorAll('svg');
    for (const svg of svgs) {
      const ariaLabel = (svg.getAttribute('aria-label') || '').toLowerCase();
      if (ariaLabel.includes('reel')) {
        return true;
      }
    }

    // 3. Texto "Reels" no header do post
    const header = container.querySelector('header') || container.firstElementChild;
    if (header) {
      const headerText = header.textContent || '';
      if (/\breels?\b/i.test(headerText)) {
        return true;
      }
    }

    // 4. Vídeo com aspecto retrato típico de Reel (9:16)
    const video = container.querySelector('video');
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      const ratio = video.videoHeight / video.videoWidth;
      if (ratio > 1.5) {
        return true;
      }
    }

    return false;
  }

  // ── Ocultar o contêiner (para Reels) — colapsa sem sair do DOM flow ──
  // Usa height:0 + overflow:hidden em vez de display:none para manter
  // o elemento no fluxo do DOM. Isso evita quebrar o virtualizer do
  // Instagram que usa scroll position para decidir o que carregar.
  function ocultarComoFantasma(container) {
    if (!container || container.getAttribute(ATTR_REEL_OCULTO) === 'true') {
      return;
    }

    container.setAttribute(ATTR_REEL_OCULTO, 'true');

    // Colapsar sem remover do DOM flow
    container.style.height = '0';
    container.style.minHeight = '0';
    container.style.maxHeight = '0';
    container.style.overflow = 'hidden';
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.border = '0';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';

    const videos = container.querySelectorAll('video');
    videos.forEach(video => {
      try {
        video.pause();
        video.muted = true;
      } catch (e) { /* Ignora erros de mídia */ }
    });

    quantidadeOcultada++;
    console.log(`${TAG} Reel ocultado (#${quantidadeOcultada}).`);
  }

  // ── Ocultar o contêiner (para Posts) — colapsa sem sair do DOM flow ──
  function ocultarPostComoFantasma(container) {
    if (!container || container.getAttribute(ATTR_POST_OCULTO) === 'true') {
      return;
    }

    container.setAttribute(ATTR_POST_OCULTO, 'true');

    // Colapsar sem remover do DOM flow
    container.style.height = '0';
    container.style.minHeight = '0';
    container.style.maxHeight = '0';
    container.style.overflow = 'hidden';
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.border = '0';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';

    console.log(`${TAG} Post ocultado.`);
  }

  // ── Restaurar Reels ocultos ────────────────────────────────────────
  function restaurarReels() {
    const ocultos = document.querySelectorAll(`[${ATTR_REEL_OCULTO}="true"]`);
    ocultos.forEach(el => {
      el.removeAttribute(ATTR_REEL_OCULTO);
      el.style.height = '';
      el.style.minHeight = '';
      el.style.maxHeight = '';
      el.style.overflow = '';
      el.style.padding = '';
      el.style.margin = '';
      el.style.border = '';
      el.style.opacity = '';
      el.style.pointerEvents = '';
    });
    quantidadeOcultada = 0;
    console.log(`${TAG} Reels restaurados.`);
  }

  // ── Restaurar Posts ocultos ────────────────────────────────────────
  function restaurarPosts() {
    const ocultos = document.querySelectorAll(`[${ATTR_POST_OCULTO}="true"]`);
    ocultos.forEach(el => {
      el.removeAttribute(ATTR_POST_OCULTO);
      el.style.height = '';
      el.style.minHeight = '';
      el.style.maxHeight = '';
      el.style.overflow = '';
      el.style.padding = '';
      el.style.margin = '';
      el.style.border = '';
      el.style.opacity = '';
      el.style.pointerEvents = '';
    });
    console.log(`${TAG} Posts restaurados.`);
  }

  // ── Lógica principal: varrer o feed ────────────────────────────────
  function processarFeed() {
    if (!config.reels) return;

    const articles = document.querySelectorAll('article');
    articles.forEach(article => {
      if (article.getAttribute(ATTR_REEL_OCULTO) === 'true') return;
      const temVideo = article.querySelector('video');
      if (!temVideo) return;
      if (isReel(article)) {
        ocultarComoFantasma(article);
      }
    });

    processarVideosOrfaos();
  }

  function processarPosts() {
    if (!config.posts) return;

    const articles = document.querySelectorAll('article');
    articles.forEach(article => {
      if (article.getAttribute(ATTR_POST_OCULTO) === 'true') return;
      if (article.getAttribute(ATTR_REEL_OCULTO) === 'true') return; // Já é um Reel oculto, pular
      if (isPost(article)) {
        ocultarPostComoFantasma(article);
      }
    });
  }

  // Vídeos fora de <article> (Geralmente Reels soltos)
  function processarVideosOrfaos() {
    const videosOrfaos = document.querySelectorAll('video');
    videosOrfaos.forEach(video => {
      const container =
        video.closest('[role="presentation"]') ||
        video.closest('[role="menuitem"]') ||
        video.closest('div[style]');

      if (!container) return;
      if (container.getAttribute(ATTR_REEL_OCULTO) === 'true') return;

      const possivelReel =
        container.closest('article') === null && isReel(container);

      if (possivelReel && config.reels) {
        ocultarComoFantasma(container);
      }
    });
  }

  // ── Garantir Infinite Scroll (Monitor Contínuo) ─────────────────────
  // Monitora continuamente o scroll do usuário. Quando ele se aproxima
  // do final da página (onde itens ocultos criaram espaço vazio),
  // força o Instagram a carregar mais conteúdo.
  let scrollMonitorAtivo = false;
  let forcarEmAndamento = false;
  let scrollCheckTimer = null;
  let ultimaAltura = 0;            // para detectar "stall" (parou de carregar)
  let tentativasStall = 0;
  const MAX_TENTATIVAS_STALL = 8;
  const LIMIAR_FUNDO_PX = 800;    // dispara quando faltam 800px para o fundo

  function iniciarMonitorScroll() {
    if (scrollMonitorAtivo) return;
    scrollMonitorAtivo = true;

    window.addEventListener('scroll', onScrollCheck, { passive: true });
    console.log(`${TAG} Monitor de infinite scroll ativado.`);

    // Verificar imediatamente se já precisa carregar mais
    verificarEForcar();
  }

  function pararMonitorScroll() {
    scrollMonitorAtivo = false;
    window.removeEventListener('scroll', onScrollCheck);
    if (scrollCheckTimer) { clearTimeout(scrollCheckTimer); scrollCheckTimer = null; }
    forcarEmAndamento = false;
    tentativasStall = 0;
  }

  // Chamado a cada scroll do usuário (com debounce leve)
  function onScrollCheck() {
    if (scrollCheckTimer) clearTimeout(scrollCheckTimer);
    scrollCheckTimer = setTimeout(verificarEForcar, 150);
  }

  // Verifica se o usuário está perto do fundo e se precisa forçar carregamento
  function verificarEForcar() {
    scrollCheckTimer = null;
    if (!config.reels && !config.posts) return;
    if (forcarEmAndamento) return;

    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const distanciaDoFinal = scrollHeight - (scrollY + innerHeight);

    // Caso 1: conteúdo nem preenche a viewport
    const viewportVazia = scrollHeight <= innerHeight + 200;
    // Caso 2: usuário está perto do fundo da página
    const pertoDoFundo = distanciaDoFinal < LIMIAR_FUNDO_PX;

    if (viewportVazia || pertoDoFundo) {
      forcarCarregamento();
    }
  }

  // Força o Instagram a carregar mais itens
  // Descoberta: o Instagram recarrega conteúdo quando o scroll viaja ao TOPO.
  // Novo comportamento: Fazemos o scroll ao topo e a restauração de forma
  // **síncrona** (sem setTimeout). Como o Javascript bloqueia a renderização
  // (paint) da tela enquanto roda, o usuário não verá os "teleportes" visuais.
  function forcarCarregamento() {
    if (forcarEmAndamento) return;
    forcarEmAndamento = true;

    const alturaAntes = document.documentElement.scrollHeight;
    const posicaoOriginal = window.scrollY;

    console.log(`${TAG} Forçando carregamento silencioso (tentativa ${tentativasStall + 1}/${MAX_TENTATIVAS_STALL})...`);

    // Dispara um resize para forçar as listas virtualizadas do React a recálculo
    window.dispatchEvent(new Event('resize'));

    // BLOCO SÍNCRONO: Pulo ao topo -> Pulo ao final -> Restauração rápida
    // Nenhuma renderização ocorre entre essas linhas.
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));

    const alvos = [
      document.querySelector('main'),
      document.querySelector('section > main'),
      document.querySelector('[role="feed"]'),
      document.body,
    ];
    alvos.forEach(alvo => {
      if (alvo) alvo.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    window.scrollTo({ top: alturaAntes, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));

    window.scrollTo({ top: posicaoOriginal, behavior: 'instant' });
    // FIM DO BLOCO SÍNCRONO

    // Esperar um tempo razoável para a API do Instagram responder (1.5s)
    // Se o React precisar de frames, ele processará agora na posição correta.
    setTimeout(() => {
      const alturaDepois = document.documentElement.scrollHeight;
      forcarEmAndamento = false;

      if (alturaDepois > alturaAntes) {
        console.log(`${TAG} ✔ Novos itens carregados com sucesso.`);
        tentativasStall = 0;
        ultimaAltura = alturaDepois;
        processarFeed();
        processarPosts();
      } else {
        tentativasStall++;
        if (tentativasStall < MAX_TENTATIVAS_STALL) {
          console.log(`${TAG} Nada carregou ainda (${tentativasStall}/${MAX_TENTATIVAS_STALL}), tentando sincronizar React...`);
          setTimeout(() => forcarCarregamento(), 1500);
        } else {
          console.log(`${TAG} Limite atingido. Aguardando novo scroll do usuário.`);
          tentativasStall = 0;
        }
      }
    }, 1500);
  }

  // Chamada após cada processamento para garantir que o monitor está ativo
  function garantirInfiniteScroll() {
    if (!config.reels && !config.posts) {
      pararMonitorScroll();
      return;
    }
    iniciarMonitorScroll();
  }

  // ── MutationObserver com debounce ──────────────────────────────────
  let timerDebounce = null;
  const DEBOUNCE_MS = 300;

  const observador = new MutationObserver((mutations) => {
    const temNovosNos = mutations.some(m => m.addedNodes.length > 0);
    if (!temNovosNos) return;

    if (timerDebounce) clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      requestAnimationFrame(() => {
        processarFeed();
        processarPosts();
        garantirInfiniteScroll(); // Re-trigger se conteúdo ficou insuficiente
      });
    }, DEBOUNCE_MS);
  });

  // ── Inicialização ─────────────────────────────────────────────────
  async function iniciar() {
    await carregarConfig();
    aplicarClasses();
    criarPainel();

    observador.observe(document.body, {
      childList: true,
      subtree: true,
    });

    processarFeed();
    processarPosts();
    console.log(`${TAG} Extensão v3.0 iniciada. Painel de controle ativo.`);
  }

  if (document.body) {
    iniciar();
  } else {
    document.addEventListener('DOMContentLoaded', iniciar);
  }
})();