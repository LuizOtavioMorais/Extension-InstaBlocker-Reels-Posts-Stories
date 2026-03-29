# 🎬 Ocultador de Reels — Extensão para Navegador (v3.0)

Extensão de navegador que permite **ocultar Reels, Posts e Stories** no Instagram. Funciona no **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox** e qualquer navegador baseado em Chromium.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🎬 **Ocultar Reels** | Remove Reels do feed principal, carrosséis de Reels sugeridos, aba Reels em perfis e modais de Reel |
| 📷 **Ocultar Posts** | Remove posts com imagens do feed (diferencia automaticamente posts de Reels) |
| ⏳ **Ocultar Stories** | Remove a barra de Stories no topo do feed e stories na barra lateral |

## 🖥️ Painel de Controle

A extensão adiciona um **botão flutuante** (☰) no canto superior direito do Instagram. Ao clicar, um dropdown aparece com toggles para ativar/desativar cada funcionalidade individualmente.

As configurações são **salvas automaticamente** no armazenamento local do navegador, então suas preferências persistem entre sessões.

---

## 📦 Instalação

### Google Chrome / Microsoft Edge (Chromium)

1. **Baixe o código** — Clone o repositório ou baixe como ZIP e extraia:

   ```bash
   git clone https://github.com/LuizOtavioMorais/Extension-InstaBlocker-Reels-Posts-Stories.git
   ```

2. **Acesse a página de extensões** do navegador:
   - **Chrome:** Digite `chrome://extensions` na barra de endereço
   - **Edge:** Digite `edge://extensions` na barra de endereço

3. **Ative o Modo de Desenvolvedor** — No canto superior direito da página, ative o toggle **"Modo do desenvolvedor"** (ou "Developer mode").

4. **Carregue a extensão** — Clique no botão **"Carregar sem compactação"** (ou "Load unpacked").

5. **Selecione a pasta** — Navegue até a pasta onde você baixou/extraiu o projeto (`Extension-InstaBlocker-Reels-Posts-Stories`) e selecione-a.

6. **Pronto!** ✅ — A extensão aparecerá na lista de extensões instaladas. Abra o Instagram e o painel de controle estará disponível.

### Mozilla Firefox

1. **Baixe o código** — Clone o repositório ou baixe como ZIP e extraia.

2. **Acesse a página de depuração:** Digite `about:debugging#/runtime/this-firefox` na barra de endereço.

3. **Carregar extensão temporária** — Clique em **"Carregar extensão temporária..."** (ou "Load Temporary Add-on...").

4. **Selecione o arquivo `manifest.json`** dentro da pasta do projeto.

5. **Pronto!** ✅ — A extensão será carregada temporariamente (ela será removida ao fechar o Firefox).

> ⚠️ **Nota:** No Firefox, extensões carregadas em modo de depuração são **temporárias**. Para instalação permanente, é necessário assinar a extensão via [addons.mozilla.org](https://addons.mozilla.org).

---

## 🚀 Como Usar

1. **Abra o Instagram** ([instagram.com](https://www.instagram.com)) no navegador.

2. **Localize o botão** — No canto superior direito da página, você verá um botão com as cores do Instagram (gradiente roxo/vermelho/amarelo) com o ícone ☰.

3. **Clique no botão** — Um painel dropdown aparecerá com as opções:

   - 🎬 **Reels** — Oculta Reels no feed
   - 📷 **Posts** — Oculta posts com imagens
   - ⏳ **Stories** — Oculta a barra de Stories

4. **Ative os toggles** que desejar — cada opção funciona independentemente.

5. **As configurações são salvas automaticamente** — ao reabrir o Instagram, suas preferências serão mantidas.

---

## 📁 Estrutura do Projeto

```
Extension-InstaBlocker-Reels-Posts-Stories/
├── manifest.json    # Configuração da extensão (Manifest V3)
├── content.js       # Script principal injetado no Instagram
├── styles.css       # Estilos do painel de controle e regras de ocultação
├── icons/           # Ícones da extensão (16, 32, 48, 128px)
│   ├── 16.png
│   ├── 32.png
│   ├── 48.png
│   └── 128.png
└── README.md        # Este arquivo
```

### Descrição dos Arquivos

| Arquivo | Descrição |
|---|---|
| `manifest.json` | Define metadados da extensão, permissões (`storage`), e quais scripts/estilos injetar no Instagram. Usa **Manifest V3** com compatibilidade Firefox (Gecko). |
| `content.js` | Script injetado em todas as páginas do Instagram. Contém toda a lógica: detecção de Reels/Posts, painel de controle, persistência de configurações e gerenciamento de infinite scroll. |
| `styles.css` | Estilos do painel flutuante (botão, dropdown, toggles) e regras CSS de ocultação para Reels, Posts e Stories. |

---

## ⚙️ Como Funciona (Visão Técnica)

### Estratégia: "Fantasma no Lugar"

O Instagram usa **virtualização de lista** — ele estima alturas dos itens para calcular posições de scroll. Se simplesmente removermos um elemento com `display: none`, a altura total muda e causa **pulos visuais** no scroll.

A solução adotada é transformar o elemento em um **"fantasma"**: ele continua no DOM com `height: 0`, `overflow: hidden` e `opacity: 0`, mantendo o fluxo do layout intacto enquanto fica completamente invisível e inerte.

### Detecção de Conteúdo

- **Reels:** Detectados por links com `/reel/` ou `/reels/`, SVGs com `aria-label` contendo "reel", texto "Reels" no header, ou vídeos com aspecto retrato (proporção > 1.5).
- **Posts:** Identificados por imagens de CDN do Instagram (`scontent`, `cdninstagram`) maiores que 150px, excluindo elementos já identificados como Reels.

### Infinite Scroll

A extensão monitora o scroll do usuário. Quando elementos são ocultados e o conteúdo visível fica insuficiente, ela força o Instagram a carregar mais itens utilizando técnicas de sincronização com o React virtualizer.

### MutationObserver

Um `MutationObserver` com debounce (300ms) monitora adições ao DOM, processando automaticamente novos Reels e Posts conforme o usuário navega pelo feed.

---

## 🛠️ Desenvolvimento

### Pré-requisitos

- Navegador compatível (Chrome, Edge, Firefox ou qualquer Chromium)
- Nenhuma dependência externa — a extensão é 100% vanilla JavaScript/CSS

### Testando Alterações

1. Faça suas alterações nos arquivos do projeto.
2. Vá até a página de extensões do navegador (`chrome://extensions`).
3. Clique no botão **🔄 Recarregar** na extensão (ou pressione o ícone de reload).
4. Recarregue a página do Instagram (`F5` ou `Ctrl+R`).

### Depuração

Abra o **DevTools** (`F12`) no Instagram e filtre o console pela tag `[OcultadorDeReels]` para ver os logs da extensão.

---

## 📄 Licença

Este projeto é de uso livre. Sinta-se à vontade para modificar e distribuir.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Se encontrar bugs ou tiver sugestões:

1. Abra uma **Issue** descrevendo o problema ou sugestão.
2. Faça um **Fork** do projeto.
3. Crie uma **branch** para sua feature (`git checkout -b minha-feature`).
4. Faça o **commit** (`git commit -m 'Adiciona minha feature'`).
5. Faça o **push** (`git push origin minha-feature`).
6. Abra um **Pull Request**.
