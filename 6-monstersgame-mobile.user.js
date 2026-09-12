// ==UserScript==
// @name         MonstersGame - Shell Mobile
// @namespace    http://tampermonkey.net/
// @version      5.5
// @description  Versão mobile REDESENHADA do zero: corrige a tabela de "Mensagens de ataque/defesa" sendo erroneamente transformada em comparação "vs" do relatório de combate (agora exige a marca "vs"/"vs." de verdade antes de aplicar esse layout); remove o espaço vazio enorme antes do botão "Mais" (não reserva mais espaço pra bolha da toolbar, que já não fica mais ali); sistema de regionalização (PT/EN/ES/DE/FR); corrige a ordem do menu não persistir depois de mover item entre a barra e o "Mais"; corrige a barra de status sendo sobreposta pelo menu; reforça o reposicionamento da toolbar moonID; 3 estilos de ícone escolhíveis; itens do menu totalmente arrastáveis entre a barra E o "Mais"; corrige fundo transparente nos cards; esconde #header/#footer via JS persistente; corrige o bug do ícone "Mensagens" sumir; corrige o scroll horizontal do Highscore; reconstrói o conteúdo em cards próprios; corrige o container fixo de 990px; força largura fluida em formulários; tabelas simples viram listas de dados; barras de atributo corrigidas; mapas de imagem clicáveis recalculados; tipografia otimizada para mobile
// @author       Você
// @match        *://*.monstersgame.moonid.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Log sempre ativo (independe da flag DEBUG) só pra confirmar que o
    // script chegou a executar nesta página, mesmo antes de qualquer checagem.
    console.log('[MG Mobile] script injetado, largura da janela:', window.innerWidth, 'em', location.href);

    // Só ativa em telas pequenas (celular/tablet em pé). Em desktop, não faz nada.
    //
    // IMPORTANTE: sem a tag de viewport corrigida (que só aplicamos DEPOIS
    // dessa checagem), navegadores mobile fingem ter uma tela larga (~990px)
    // e escalam visualmente — então window.innerWidth pode mentir aqui.
    // screen.width reflete o tamanho físico real do aparelho e não sofre
    // desse problema, então priorizamos ele. Também checamos o user-agent
    // como sinal extra, e mantemos innerWidth como fallback (útil pro modo
    // de emulação de dispositivo do DevTools).
    const MOBILE_BREAKPOINT = 820;
    function isMobileViewport() {
        const screenWidth = window.screen && window.screen.width ? window.screen.width : Infinity;
        const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent || '');
        const smallWidth = Math.min(window.innerWidth, screenWidth) <= MOBILE_BREAKPOINT;
        return isMobileUA || smallWidth;
    }

    if (!isMobileViewport()) {
        console.log('[MG Mobile] largura acima do breakpoint (' + MOBILE_BREAKPOINT + 'px) e user-agent não é mobile, script não vai ativar o modo mobile.');
        return; // sai cedo, sem nenhum custo em desktop
    }

    const DEBUG = true;
    function log(...args) { if (DEBUG) console.log('[MG Mobile]', ...args); }

    log('script mobile carregado, largura da tela:', window.innerWidth, 'em', location.href);

    // =========================================================
    // 1. VIEWPORT CORRETO
    // =========================================================
    try {
        function fixViewport() {
            let meta = document.querySelector('meta[name="viewport"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                (document.head || document.documentElement).appendChild(meta);
            }
            meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
        }
        fixViewport();
    } catch (e) { log('erro na seção 1 (viewport):', e); }

    // =========================================================
    // 2. O PROBLEMA PRINCIPAL: container fixo em 990px
    // =========================================================
    // Descobrimos (inspecionando o jogo real) que TODA a página fica
    // dentro de uma <div style="width:990px;margin:0 auto;">. É isso
    // que faz o celular renderizar tudo minúsculo. Forçamos essa
    // div a ser fluida (ocupa a tela toda, até um máximo de 990px).
    function fixFixedWidthContainer() {
        const containers = document.querySelectorAll('#contentbereich > div[style*="990px"]');
        containers.forEach(el => {
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('max-width', '990px', 'important');
            el.style.setProperty('margin', '0 auto', 'important');
            el.style.setProperty('box-sizing', 'border-box', 'important');
        });
        if (containers.length) log('container 990px corrigido para fluido:', containers.length);
        return containers.length > 0;
    }
    try {
        fixFixedWidthContainer();
        // Fica vigiando permanentemente (não só por alguns segundos) —
        // se o container demorar mais que o esperado pra aparecer num
        // celular real, ou se algo tentar resetar o estilo, a correção
        // é reaplicada na hora. A regra CSS logo acima (seção 3) já
        // cobre a maioria dos casos instantaneamente; isso é a segunda
        // camada de segurança.
        const widthFixObserver = new MutationObserver(() => fixFixedWidthContainer());
        widthFixObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    } catch (e) { log('erro na seção 2 (largura fixa):', e); }

    // =========================================================
    // 3. CSS BASE: overflow, legibilidade, toque, tipografia
    // =========================================================
    try {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=EB+Garamond:wght@400;500;600&display=swap';
        (document.head || document.documentElement).appendChild(fontLink);

        const baseStyle = document.createElement('style');
        baseStyle.id = 'mg-mobile-base-style';
        baseStyle.textContent = `
            html, body {
                max-width: 100vw;
                overflow-x: hidden;
            }
            body {
                -webkit-text-size-adjust: 100%;
                font-family: 'EB Garamond', Georgia, serif !important;
                font-size: 17px !important;
                line-height: 1.5 !important;
            }
            /* CORREÇÃO DO CONTAINER FIXO DE 990px — via CSS puro, não só
               via JavaScript. Isso é importante: uma regra CSS se aplica
               IMEDIATAMENTE a qualquer elemento correspondente assim que
               ele existir no DOM, sem depender de "chegar a tempo" como
               um script que varre a página em intervalos. Isso é a rede
               de segurança definitiva caso a correção via JS (mais abaixo)
               demore mais que o esperado pra rodar num celular real. */
            #contentbereich > div[style*="990px"] {
                width: 100% !important;
                max-width: 990px !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            }
            /* A moldura ornamental original (bordas/cantos decorativos) só
               ocupa espaço vertical precioso em telas pequenas e não tem
               função — escondemos em mobile. */
            #header {
                display: none !important;
            }
            /* Links de menu e botões ganham mais área de toque */
            a, button, input[type="submit"], input[type="image"] {
                min-height: 30px;
            }
            /* IMPORTANTE: as barrinhas de atributo (Força, Defesa, Energia
               vital etc.) são desenhadas com 3 imagens (charts.gif +
               chartm.gif + charte.gif) coladas lado a lado, onde a do meio
               é "esticada" via atributo HTML width/height (ex: width="200"
               height="13"). Se aplicarmos height:auto nelas, o navegador
               recalcula a altura a partir da proporção NATURAL da imagem
               (que é bem pequena/quadrada), e a barra vira um blocão
               enorme ao invés de uma linha fina. Por isso excluímos
               qualquer <img> cujo src contenha "chart" dessa regra. */
            img:not([src*="chart"]) {
                max-width: 100% !important;
                height: auto !important;
            }
            /* Barra de status inferior do próprio jogo (Memo, Energia,
               Ouro, Experiência...): era uma linha só, cortada. Vira uma
               fileira de "pílulas" com scroll horizontal, empilhada
               ACIMA da nossa barra de navegação (item 5). O "bottom: 54px"
               aqui é só um valor de segurança pro primeiro instante —
               assim que a barra de navegação é criada, um CSS mais
               específico (inserido depois, então vence) ajusta isso pra
               bater exatamente com a altura real dela. */
            #statbar {
                position: fixed !important;
                left: 0 !important; right: 0 !important;
                bottom: 54px !important;
                display: flex !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch;
                gap: 6px !important;
                padding: 6px 8px !important;
                background: linear-gradient(0deg, #1c0505 70%, rgba(28,5,5,0.97)) !important;
                border-top: 1px solid #7a1f1f !important;
                z-index: 999998 !important;
                height: auto !important;
                width: auto !important;
                max-width: 100vw !important;
                box-sizing: border-box !important;
            }
            /* O textarea do Memo e a lista de atributos em texto puro
               (redundante com a página "Resumo") tomam espaço demais —
               escondidos em mobile pra sobrar espaço pros números que
               importam no dia a dia. */
            #statbarMemoCanvas, #statbarStatDetails, .statbarMemo {
                display: none !important;
            }
            #statbar .statbarEntry {
                flex: 0 0 auto !important;
                display: inline-block !important;
                background: #26090c;
                border: 1px solid #5c1414;
                border-radius: 8px;
                padding: 4px 10px !important;
                font-size: 11px !important;
                white-space: nowrap;
                color: #e8d8c0;
            }
            /* Classe usada em banners com largura de 990px cravada
               diretamente no CSS da própria página (ex: vencedor de
               torneio na Arena, vencedor de combate no relatório) */
            .headerRowCWinner {
                width: 100% !important;
                max-width: 990px !important;
                box-sizing: border-box !important;
                background: linear-gradient(135deg, #3a0d0d, #1c0505) !important;
                background-image: none !important;
                border: 1px solid #d8b872 !important;
                border-radius: 10px;
                padding: 14px !important;
                height: auto !important;
                text-align: center !important;
                font-family: 'Cinzel', Georgia, serif !important;
                color: #f0d9a0 !important;
            }
            /* <a> que embrulha um card inteiro (ex: banner "Vencedor:
               fulano" que leva pros detalhes do combate) — precisa virar
               bloco pra ocupar a largura toda e parecer clicável de verdade.
               Mantém fundo sólido (igual aos outros cards) — sem isso, a
               imagem de fundo decorativa do jogo (atrás de tudo) aparecia
               por trás do texto, dificultando a leitura. */
            .mg-card-link-wrap {
                padding: 0 !important;
                background: linear-gradient(180deg, #2a0a0a, #1a0505) !important;
                overflow: hidden; /* cantos arredondados do card "cortam" o conteúdo interno certinho */
            }
            .mg-card-link-wrap > a {
                display: block;
                text-decoration: none !important;
            }

            /* ---- CARDS RECONSTRUÍDOS (item 4) ---- */
            #mg-rebuilt-content {
                padding: 10px 10px 4px;
                max-width: 100vw;
                box-sizing: border-box;
            }
            .mg-card {
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #5c1414;
                border-radius: 10px;
                padding: 12px 14px;
                margin-bottom: 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                /* Contém qualquer elemento interno (input, select, tabela,
                   imagem) que tente ser mais largo que o card — evita que
                   UM elemento largo empurre a página inteira de lado,
                   cortando texto nas duas bordas. Diferente da tentativa
                   anterior (que travava #maincontent inteiro), isso é
                   escopado só ao card individual, e o scroll automático
                   (item 7) continua cuidando de tabelas grandes de verdade. */
                max-width: 100%;
                overflow-x: hidden;
                box-sizing: border-box;
            }
            .mg-card * { box-sizing: border-box; max-width: 100%; }
            .mg-card table { max-width: none; } /* tabela pode ter várias colunas — rola internamente (item 7), não é limitada aqui */
            .mg-card-title {
                font-family: 'Cinzel', Georgia, serif !important;
                font-weight: 600;
                font-size: 15px;
                color: #f0d9a0;
                margin-bottom: 8px;
                padding-bottom: 7px;
                border-bottom: 1px solid #5c1414;
                line-height: 1.4;
            }
            .mg-card-title a { color: #f0d9a0; text-decoration: none; }
            /* Sub-menus internos da página (ex: "Para o comerciante / Para
               o cemitério..." na Cidade) viram uma fileira de pílulas
               roláveis, em vez de título. */
            .mg-card-subnav {
                display: flex;
                flex-wrap: nowrap;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                gap: 6px;
                border-bottom: none;
                padding-bottom: 4px;
            }
            .mg-card-subnav a {
                flex: 0 0 auto;
                background: #26090c;
                border: 1px solid #5c1414;
                border-radius: 16px;
                padding: 6px 12px !important;
                font-family: 'EB Garamond', serif !important;
                font-size: 13px;
                color: #e8d8c0 !important;
                text-decoration: none !important;
                white-space: nowrap;
            }
            .mg-card-body {
                font-size: 15px;
                line-height: 1.55;
                color: #e8d8c0;
                text-align: left !important;
            }
            .mg-card-body table { width: 100% !important; border-collapse: collapse; }
            .mg-card-body td { padding: 5px 3px; vertical-align: middle; }
            .mg-card-body tr:not(:last-child) td { border-bottom: 1px solid rgba(92,20,20,0.35); }
            .mg-card-body a { color: #e07070; }
            .mg-card-body img { border-radius: 6px; }
            .mg-card.mg-card-plain {
                /* Antes era transparente — deixava a imagem de fundo
                   decorativa do jogo (atrás de tudo, no #contentbereich)
                   aparecer por trás do texto, dificultando a leitura.
                   Agora usa o mesmo fundo sólido dos outros cards. */
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #5c1414;
            }
            /* Conteúdo que fica DENTRO de um <form> preservado (item 4) —
               não movemos o headerRow/pageContent pra fora do form (isso
               quebraria o envio dos botões), então estilizamos eles onde
               estão, via seletor descendente. */
            .mg-card-form .headerRow,
            .mg-card-form .headerRowSC,
            .mg-card-form .headerRowC {
                font-family: 'Cinzel', Georgia, serif !important;
                font-weight: 600;
                font-size: 15px;
                color: #f0d9a0;
                margin: 2px 0 10px;
                padding-bottom: 7px;
                border-bottom: 1px solid #5c1414;
                text-align: left !important;
                /* Remove a barra decorativa original (mgp_bar.jpg) que
                   vinha "por baixo" do texto — deixava a fonte deste
                   título diferente dos outros cards do app. */
                background: none !important;
                background-image: none !important;
                width: auto !important;
                height: auto !important;
                min-height: 0 !important;
                padding-top: 0 !important;
            }
            .mg-card-form .pageContent,
            .mg-card-form .pageContentC {
                font-size: 15px;
                line-height: 1.55;
                color: #e8d8c0;
                margin-bottom: 10px;
                text-align: left !important;
            }
            /* Imagens de mapa clicável (Cidade, Cemitério, Guarda) — a
               imagem original é grande (feita pra desktop). Limitamos a
               altura também (não só a largura) pra nunca dominar a tela,
               mesmo em imagens com proporção mais "quadrada". O
               recálculo das áreas clicáveis (item 6) já lê o tamanho
               real depois dessa restrição, então continua preciso. */
            .mg-card-form img[usemap],
            .mg-card-body img[usemap] {
                display: block;
                max-width: 100% !important;
                max-height: 240px !important;
                width: auto !important;
                height: auto !important;
                margin: 8px 0 !important;
                border-radius: 8px;
                border: 1px solid #5c1414;
            }
            /* Ilustrações grandes "sozinhas" (guarda, ancestral, etc.)
               recebem a classe .mg-standalone-img via JS (item 4b) —
               só ESSAS viram blocos com margem e cantos arredondados.
               Ícones pequenos inline (moeda, gota de sangue, "·") NÃO
               têm essa classe, e continuam fluindo normalmente dentro
               do texto (é assim que devem se comportar). */
            .mg-standalone-img {
                display: block !important;
                max-width: 100% !important;
                height: auto !important;
                margin: 8px 0 !important;
                border-radius: 8px;
            }
            /* Listas de dados (substituem tabelas simples de 2-3 colunas —
               ver função restructureSimpleTables) */
            .mg-datalist {
                width: 100%;
            }
            .mg-datalist-row {
                padding: 8px 0;
                border-bottom: 1px solid rgba(92,20,20,0.35);
            }
            .mg-datalist-row:last-child { border-bottom: none; }
            .mg-datalist-label {
                font-size: 13px;
                color: #b89a7a;
                margin-bottom: 2px;
            }
            .mg-datalist-value {
                font-size: 15px;
                color: #e8d8c0;
            }
            .mg-datalist-value input[type="text"],
            .mg-datalist-value input[type="number"] {
                max-width: 100%;
            }
            .mg-datalist-row-top {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 10px;
            }
            .mg-datalist-row-top .mg-datalist-label {
                font-size: 14px;
                color: #e8d8c0;
                margin-bottom: 0;
            }
            .mg-datalist-action {
                font-size: 13px;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .mg-datalist-action a {
                color: #e07070 !important;
                text-decoration: none;
            }
            .mg-datalist-bar {
                margin-top: 6px;
                line-height: 0;
            }
            .mg-datalist-bar img[src*="chart"] {
                max-width: 100% !important;
            }
            /* Tabela de comparação "vs" (relatório de combate) — vira
               duas colunas lado a lado (ou empilha se a tela for bem
               estreita), com um "vs" no meio */
            .mg-vs-compare {
                display: flex;
                align-items: flex-start;
                gap: 6px;
            }
            .mg-vs-side {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .mg-vs-label {
                flex-shrink: 0;
                align-self: center;
                font-family: 'Cinzel', Georgia, serif;
                font-size: 12px;
                color: #b08060;
                padding: 0 4px;
                margin-top: 40px;
            }
            .mg-vs-portrait img {
                max-width: 100% !important;
                max-height: 90px !important;
                width: auto !important;
                height: auto !important;
                border-radius: 6px;
                margin-bottom: 4px;
            }
            .mg-vs-name {
                font-family: 'Cinzel', Georgia, serif;
                font-size: 12px;
                color: #f0d9a0;
                margin-bottom: 6px;
                line-height: 1.3;
            }
            .mg-vs-stat {
                width: 100%;
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                padding: 3px 0;
                border-bottom: 1px solid rgba(92,20,20,0.3);
                gap: 4px;
            }
            .mg-vs-stat span:first-child { color: #b89a7a; flex-shrink: 0; }
            .mg-vs-stat span:last-child { color: #e8d8c0; text-align: right; }
            @media (max-width: 340px) {
                .mg-vs-compare { flex-direction: column; }
                .mg-vs-label { margin: 6px 0; }
            }
            .mg-card-form .hidden { display: none !important; }
            .mg-card-form input[type="submit"],
            .mg-card-form button {
                background: #6b1616 !important;
                color: #ffe4c4 !important;
                border: 1px solid #a02020 !important;
                border-radius: 6px !important;
                padding: 8px 16px !important;
                font-size: 14px !important;
                margin-top: 6px;
            }
            .mg-card-form select,
            .mg-card-form input[type="text"],
            .mg-card-form input[type="number"] {
                font-size: 15px !important;
                padding: 6px 8px !important;
                background: #1a0508 !important;
                color: #e8d8c0 !important;
                border: 1px solid #5c1414 !important;
                border-radius: 6px !important;
                margin: 4px 0 !important;
            }
            .mg-card-form p { margin: 4px 0 8px !important; }

            /* =====================================================
               CORREÇÕES VISUAIS ESPECÍFICAS POR PÁGINA
               ===================================================== */

            /* 1. MEMO — reaparecer como painel flutuante quando clicado */
            #statbar .statbarMemo,
            #statbarMemoCanvas {
                display: none !important; /* esconde o textarea dentro do statbar */
            }
            #mg-memo-panel {
                position: fixed;
                bottom: 130px;
                left: 8px;
                right: 8px;
                z-index: 999997;
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #7a1f1f;
                border-radius: 10px;
                padding: 10px;
                display: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            }
            #mg-memo-panel textarea {
                width: 100%;
                min-height: 80px;
                background: #120305;
                border: 1px solid #5c1414;
                border-radius: 6px;
                color: #e8d8c0;
                font-family: 'EB Garamond', serif;
                font-size: 14px;
                padding: 6px;
                resize: none;
                box-sizing: border-box;
            }
            #mg-memo-panel .mg-memo-close {
                position: absolute;
                top: 6px;
                right: 10px;
                color: #b08060;
                font-size: 18px;
                cursor: pointer;
                line-height: 1;
            }

            /* 2. OBJECTOS — cards lado a lado com imagem + info */
            .mg-card-body .tdn_equipment,
            .mg-card-body table.equipmentlist,
            .mg-card-body td.item_image { max-width: 100%; }
            .mg-card-body .item_image img { max-width: 80px !important; height: auto !important; border-radius: 6px; }
            .mg-card-body .item_image { width: 90px !important; vertical-align: top; }
            .mg-card-body .item_info { vertical-align: top; font-size: 13px; }
            .mg-card-body .item_name { font-family: 'Cinzel', serif; color: #f0d9a0; margin-bottom: 4px; }

            /* 3. TALENTOS — preservar grid de ícones (5 por linha)
               e corrigir a barra de progresso dos talentos */
            .mg-card-body table.tdn_accomplishments,
            .mg-card-body table[class*="talent"],
            .mg-card-body .tdn_accomplishments {
                max-width: none !important;
                overflow-x: auto !important;
            }
            /* Imagens de talentos: manter tamanho original sem expandir */
            .mg-card-body .tdn_accomplishments img,
            .mg-card-body td.talent_icon img,
            .mg-card-body .talent_img img {
                max-width: none !important;
                height: auto !important;
            }
            /* Barra de progresso de talentos — preservar layout horizontal */
            .mg-card-body table.talent_progress td,
            .mg-card-body .talent_progress td {
                white-space: nowrap;
                vertical-align: middle;
            }
            .mg-card-body .talent_progress img {
                max-width: none !important;
            }

            /* 4. ITENS DE CAÇA (aneis, amuletos) — grid horizontal */
            /* Os itens de caça ficam numa linha de imagens clicáveis
               dentro de um <div> ou <td> — vamos forçá-los a ficarem
               lado a lado em vez de quebrarem linha */
            .mg-card-body .hunt_items,
            .mg-card-body div[id*="hunt"],
            .mg-card-body .raubzug_items {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 8px !important;
                justify-content: center;
            }
            .mg-card-body .hunt_items img,
            .mg-card-body .raubzug_items img {
                max-width: 52px !important;
                height: auto !important;
            }
            /* Fallback: qualquer linha de ícones pequenos de item
               dentro de pageContent de saque */
            .mg-card-body > div > a > img[width="40"],
            .mg-card-body > a > img[width="40"] {
                margin: 4px;
            }

            /* Rodapé decorativo original (só tinha imagem de fundo) */
            #footer { display: none !important; }
            .copyline {
                font-size: 10px !important;
                opacity: 0.55;
                text-align: center;
                padding: 6px 14px 100px !important;
                line-height: 1.6;
            }
            /* Tabelas/blocos ficam roláveis horizontalmente em vez de espremer o conteúdo */
            .mg-scroll-wrap {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                max-width: 100vw;
                position: relative;
                /* Barra de rolagem sempre visível (não só ao tocar), pra
                   deixar claro que dá pra arrastar pro lado */
                scrollbar-width: thin;
                scrollbar-color: #a02020 #26090c;
                border-radius: 8px;
            }
            .mg-scroll-wrap::-webkit-scrollbar {
                height: 8px;
                background: #1a0508;
            }
            .mg-scroll-wrap::-webkit-scrollbar-thumb {
                background: #a02020;
                border-radius: 4px;
            }
            .mg-scroll-wrap::-webkit-scrollbar-track {
                background: #1a0508;
                border-radius: 4px;
            }
            /* Container "pai" do scroll-wrap, pra podermos colocar a dica
               de "arraste" grudada no canto sem interferir no scroll */
            .mg-scroll-hint {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                color: #b08060;
                margin-bottom: 4px;
                opacity: 0.85;
            }
            .mg-scroll-hint svg { flex-shrink: 0; }

            /* Dá um respiro na parte de baixo da página pras nossas duas
               barras empilhadas (statbar + navegação, item 5) não
               tamparem o conteúdo original */
            #contentbereich {
                padding-bottom: 120px !important;
                /* Remove a imagem de fundo decorativa original do jogo
                   (mgp_pagebg.jpg) — ela aparecia por trás de qualquer
                   espaço com transparência, dificultando a leitura em
                   vários lugares. */
                background: #19030f !important;
                background-image: none !important;
            }
        `;
        (document.head || document.documentElement).appendChild(baseStyle);
    } catch (e) { log('erro na seção 3 (CSS base):', e); }

    // =========================================================
    // 3b. ESCONDER #header e #footer — REFORÇO via JS persistente
    // =========================================================
    // A regra CSS "#header { display:none }" (seção 3) deveria bastar,
    // mas em alguns testes reais ela não pegou (o banner grande do jogo
    // continuou visível, sobrepondo o conteúdo). Pra não depender só de
    // uma regra CSS que pode perder uma "guerra de especificidade" com
    // algo que não vemos no CSS original do jogo, forçamos isso também
    // via JS direto no elemento (que sempre vence), e ficamos de olho
    // caso esses elementos sejam recriados/alterados depois.
    function hideHeaderAndFooter() {
        ['header', 'footer'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.style.display !== 'none') {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('overflow', 'hidden', 'important');
                el.style.setProperty('margin', '0', 'important');
                el.style.setProperty('padding', '0', 'important');
            }
        });
    }
    try {
        hideHeaderAndFooter();
        const headerFooterObserver = new MutationObserver(() => hideHeaderAndFooter());
        headerFooterObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } catch (e) { log('erro na seção 3b (esconder header/footer):', e); }

    // =========================================================
    // 4. RECONSTRUÇÃO DO CONTEÚDO EM CARDS (redesenho completo)
    // =========================================================
    // Toda página do jogo segue o mesmo padrão: uma sequência de
    // <div class="headerRow">Título</div><div class="pageContent">...</div>
    // dentro de #maincontent. Em vez de só corrigir CSS por cima da
    // estrutura original (com fundos, molduras e imagens decorativas
    // fixas em 990px), MOVEMOS o conteúdo real (texto, tabelas, links,
    // formulários — tudo funcional, nada é copiado/recriado) pra dentro
    // de cards novos, no estilo mobile. Os elementos originais (que
    // ficam vazios depois da mudança) são descartados.

    // Força, via JS + !important direto no elemento, que ele nunca tenha
    // largura/margem/float fixos vindos do CSS original do jogo (que não
    // temos acesso pra inspecionar). Isso vence qualquer regra externa,
    // não importa o que ela diga.
    function forceBoxReset(el) {
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('max-width', '100%', 'important');
        el.style.setProperty('min-width', '0', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('float', 'none', 'important');
        el.style.setProperty('position', 'static', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
        el.style.setProperty('left', 'auto', 'important');
        el.style.setProperty('right', 'auto', 'important');
        el.style.setProperty('transform', 'none', 'important');
    }

    function rebuildContentAsCards() {
        const maincontent = document.getElementById('maincontent');
        if (!maincontent) return false;
        if (maincontent.dataset.mgRebuilt === '1') return true;

        const children = Array.from(maincontent.children);
        if (children.length === 0) return false; // ainda não carregou

        const newContainer = document.createElement('div');
        newContainer.id = 'mg-rebuilt-content';

        const HEADER_CLASSES = ['headerRow', 'headerRowSC', 'headerRowC'];
        const CONTENT_CLASSES = ['pageContent', 'pageContentC'];

        let statbarEl = null;
        let i = 0;
        while (i < children.length) {
            const el = children[i];
            const classList = el.classList ? Array.from(el.classList) : [];

            if (el.id === 'statbar') {
                statbarEl = el; // tratado à parte (vira a barra de status em pílulas)
                i++;
                continue;
            }

            // Scripts/estilos soltos como filhos diretos de #maincontent
            // (comum antes do menu de sub-navegação em várias páginas)
            // NUNCA são conteúdo visível — mover o texto deles pra uma
            // div normal fazia o código JS aparecer escrito na tela.
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') {
                i++;
                continue;
            }

            // <a name="..."> âncoras vazias, sem conteúdo visual
            if (el.tagName === 'A' && !el.textContent.trim() && el.children.length === 0) {
                i++;
                continue;
            }

            if (HEADER_CLASSES.some(c => classList.includes(c))) {
                const linkCount = el.querySelectorAll('a').length;
                const isSubnav = linkCount >= 2;

                const card = document.createElement('div');
                card.className = 'mg-card';

                const titleWrap = document.createElement('div');
                titleWrap.className = isSubnav ? 'mg-card-title mg-card-subnav' : 'mg-card-title';
                while (el.firstChild) titleWrap.appendChild(el.firstChild);
                card.appendChild(titleWrap);

                let j = i + 1;
                let addedBody = false;
                while (j < children.length) {
                    const next = children[j];
                    const nextClasses = next.classList ? Array.from(next.classList) : [];
                    if (!CONTENT_CLASSES.some(c => nextClasses.includes(c))) break;
                    const bodyWrap = document.createElement('div');
                    bodyWrap.className = 'mg-card-body';
                    while (next.firstChild) bodyWrap.appendChild(next.firstChild);
                    card.appendChild(bodyWrap);
                    addedBody = true;
                    j++;
                }

                // Card só com sub-menu (sem corpo) fica compacto, sem "corpo vazio"
                if (isSubnav && !addedBody) card.style.paddingBottom = '8px';

                newContainer.appendChild(card);
                i = j;
            } else if (classList.includes('clr')) {
                i++; // divs só de "clear float", sem conteúdo útil
            } else if (el.tagName === 'FORM') {
                // Várias páginas (Cemitério, Treino, Templo, Saque, Talentos,
                // Guarda...) colocam o headerRow/pageContent DENTRO de um
                // <form> (pros botões de ação funcionarem). Não desmontamos
                // o formulário (quebraria o envio) — movemos ele inteiro pra
                // dentro de um card, e o headerRow/pageContent que sobrar
                // aninhado dentro dele ganha estilo via CSS.
                //
                // IMPORTANTE: como não temos acesso ao global.css do jogo,
                // não sabemos se existe alguma regra lá mirando elementos
                // <form> especificamente (largura fixa, float, padding etc.
                // pensados pro layout de 990px). Em vez de tentar adivinhar,
                // forçamos agressivamente — via JS, direto no elemento, com
                // !important — que o form siga exatamente as mesmas regras
                // de largura fluida que já funcionam nas páginas sem
                // formulário. Isso vence QUALQUER CSS externo, seja lá o
                // que ele diga.
                forceBoxReset(el);
                el.querySelectorAll('.headerRow, .headerRowSC, .headerRowC, .pageContent, .pageContentC').forEach(forceBoxReset);

                const card = document.createElement('div');
                card.className = 'mg-card mg-card-form';
                card.appendChild(el); // move o form inteiro, preservando tudo
                newContainer.appendChild(card);
                i++;
            } else if (el.tagName === 'A' && el.children.length > 0) {
                // Um caso específico: banners tipo "Vencedor: FULANO" na
                // página de combate são um <div class="headerRowCWinner">
                // DENTRO de um <a href="#details">. Se desmontássemos
                // (como fazemos com conteúdo órfão comum), perderíamos o
                // link. Preservamos o <a> inteiro, só damos display:block
                // nele via CSS pra funcionar como card clicável.
                const card = document.createElement('div');
                card.className = 'mg-card mg-card-plain mg-card-link-wrap';
                card.appendChild(el);
                newContainer.appendChild(card);
                i++;
            } else {
                // Conteúdo órfão (raro) fora do padrão headerRow/pageContent —
                // ainda assim preservamos, só que sem título.
                const hasContent = (el.textContent && el.textContent.trim()) || el.querySelector('img,a,table,form,input');
                if (hasContent) {
                    const card = document.createElement('div');
                    card.className = 'mg-card mg-card-plain';
                    while (el.firstChild) card.appendChild(el.firstChild);
                    newContainer.appendChild(card);
                }
                i++;
            }
        }

        maincontent.parentNode.insertBefore(newContainer, maincontent);
        maincontent.remove(); // já está vazio; os filhos reais foram todos movidos

        // O #statbar precisa ficar fora da árvore que acabamos de remover —
        // mesmo já tendo sido pulado acima, ele ainda está em algum lugar
        // do DOM original (não foi removido, só não entrou no card).
        // Reencaixamos ele direto no <body> pra nossa CSS (position:fixed)
        // continuar funcionando normalmente.
        if (statbarEl) {
            document.body.appendChild(statbarEl);
        }

        restructureSimpleTables(newContainer);
        markStandaloneImages(newContainer);
        neutralizeAbsolutePositioning(newContainer);

        log('conteúdo reconstruído em', newContainer.children.length, 'cards');
        return true;
    }

    // Tabelas simples de 2 ou 3 colunas (rótulo:valor, ou rótulo+barra+ação
    // como "Ataque: [barra] Treinar") não cabem bem no layout de tabela
    // original (pensado pra ~990px). Em vez de deixar o navegador tentar
    // encolher colunas automaticamente (o que espreme o texto do rótulo
    // numa coluna minúscula, ou empurra a barra pra fora), convertemos
    // pra uma "lista de dados" empilhada, bem mais previsível em mobile.
    // Tabelas maiores (Highscore etc.) são deixadas como estão, com
    // scroll horizontal (função de overflow já existente).
    // Tabelas de "comparação vs" (ex: relatório de combate — Vampiro X
    // contra Lobisomem Y, atributo por atributo) usam colunas divididas
    // ao meio: esquerda | separador | direita. O número de células reais
    // varia por linha (algumas usam colspan="2" pra retrato/nome, outras
    // usam 2 células separadas pra rótulo:valor) — por isso calculamos a
    // posição real de cada célula somando os colspans, em vez de supor
    // um número fixo de células por linha.
    // Confirma se a tabela é MESMO uma comparação "vs" de verdade — exige
    // achar uma célula curta com o texto literal "vs"/"vs." (é assim que
    // o relatório de combate marca o separador). Sem essa confirmação,
    // qualquer tabela comum de 5 colunas seria erroneamente tratada como
    // comparação, inserindo um "vs" onde não devia.
    function tableHasVsMarker(table) {
        const cells = table.querySelectorAll('td, th');
        for (const cell of cells) {
            const txt = cell.textContent.trim().toLowerCase();
            if ((txt === 'vs' || txt === 'vs.') && txt.length <= 3) return true;
        }
        return false;
    }

    function restructureVsComparisonTable(table, rows) {
        const compare = document.createElement('div');
        compare.className = 'mg-vs-compare';

        const leftSide = document.createElement('div');
        leftSide.className = 'mg-vs-side';
        const rightSide = document.createElement('div');
        rightSide.className = 'mg-vs-side';

        function renderSide(side, cells) {
            if (cells.length === 0) return;
            if (cells.length === 1) {
                // célula única (geralmente colspan="2"): retrato (imagem) ou nome
                const cell = cells[0];
                const hasImg = cell.querySelector('img');
                const text = cell.textContent.trim();
                const box = document.createElement('div');
                box.className = hasImg && !text ? 'mg-vs-portrait' : 'mg-vs-name';
                while (cell.firstChild) box.appendChild(cell.firstChild);
                side.appendChild(box);
            } else {
                // par rótulo:valor
                const stat = document.createElement('div');
                stat.className = 'mg-vs-stat';
                const l = document.createElement('span');
                while (cells[0].firstChild) l.appendChild(cells[0].firstChild);
                const v = document.createElement('span');
                while (cells[1].firstChild) v.appendChild(cells[1].firstChild);
                stat.appendChild(l);
                stat.appendChild(v);
                side.appendChild(stat);
            }
        }

        rows.forEach(tr => {
            const cells = Array.from(tr.children).filter(c => c.tagName === 'TD' || c.tagName === 'TH');
            if (cells.length === 0) return;

            // Linha "espaçadora" pura (uma célula só, colspan grande, sem texto)
            if (cells.length === 1 && parseInt(cells[0].getAttribute('colspan') || '1', 10) >= 4) return;

            let cum = 0;
            const leftCells = [], rightCells = [];
            cells.forEach(cell => {
                const span = parseInt(cell.getAttribute('colspan') || '1', 10);
                const start = cum;
                cum += span;
                if (start < 2) leftCells.push(cell);
                else if (start >= 3) rightCells.push(cell);
                // start entre 2 e 3 = célula separadora do meio ("vs.", &nbsp;) — ignorada
            });

            renderSide(leftSide, leftCells);
            renderSide(rightSide, rightCells);
        });

        compare.appendChild(leftSide);
        const vsLabel = document.createElement('div');
        vsLabel.className = 'mg-vs-label';
        vsLabel.textContent = 'vs';
        compare.appendChild(vsLabel);
        compare.appendChild(rightSide);

        table.parentNode.insertBefore(compare, table);
        table.remove();
    }

    function restructureSimpleTables(container) {
        container.querySelectorAll('table').forEach(table => {
            const rows = Array.from(table.children).find(c => c.tagName === 'TBODY')
                ? Array.from(table.querySelector('tbody').children).filter(c => c.tagName === 'TR')
                : Array.from(table.children).filter(c => c.tagName === 'TR');
            if (rows.length === 0) return;

            let maxCols = 0;
            rows.forEach(tr => {
                let cols = 0;
                Array.from(tr.children).forEach(cell => {
                    cols += parseInt(cell.getAttribute('colspan') || '1', 10);
                });
                if (cols > maxCols) maxCols = cols;
            });
            // Tabela de comparação "vs" (ex: relatório de combate) só é
            // reconhecida se tiver 5 colunas E uma célula literalmente
            // escrita "vs"/"vs." (marca de verdade dessas tabelas). Sem
            // isso, QUALQUER tabela comum de 5 colunas (ex: a lista de
            // "Mensagens de ataque", que tem Data/Vítima/Preciosidades/
            // ícone da moeda/Acção — 5 colunas por coincidência) acabava
            // sendo tratada como se fosse uma comparação de combate,
            // inserindo um "vs" onde não devia e bagunçando as linhas.
            if (maxCols === 5 && tableHasVsMarker(table)) {
                restructureVsComparisonTable(table, rows);
                return;
            }
            if (maxCols < 2 || maxCols > 3) return; // só tabelas simples

            const list = document.createElement('div');
            list.className = 'mg-datalist';

            rows.forEach(tr => {
                const cells = Array.from(tr.children).filter(c => c.tagName === 'TD' || c.tagName === 'TH');
                if (cells.length === 0) return;

                const row = document.createElement('div');
                row.className = 'mg-datalist-row';

                if (cells.length === 2) {
                    const label = document.createElement('div');
                    label.className = 'mg-datalist-label';
                    while (cells[0].firstChild) label.appendChild(cells[0].firstChild);

                    const value = document.createElement('div');
                    value.className = 'mg-datalist-value';
                    while (cells[1].firstChild) value.appendChild(cells[1].firstChild);

                    row.appendChild(label);
                    row.appendChild(value);
                } else if (cells.length === 3) {
                    const top = document.createElement('div');
                    top.className = 'mg-datalist-row-top';

                    const label = document.createElement('div');
                    label.className = 'mg-datalist-label';
                    while (cells[0].firstChild) label.appendChild(cells[0].firstChild);

                    const action = document.createElement('div');
                    action.className = 'mg-datalist-action';
                    while (cells[2].firstChild) action.appendChild(cells[2].firstChild);

                    top.appendChild(label);
                    top.appendChild(action);

                    const bar = document.createElement('div');
                    bar.className = 'mg-datalist-bar';
                    while (cells[1].firstChild) bar.appendChild(cells[1].firstChild);

                    row.appendChild(top);
                    row.appendChild(bar);
                } else {
                    while (cells[0].firstChild) row.appendChild(cells[0].firstChild);
                }

                list.appendChild(row);
            });

            table.parentNode.insertBefore(list, table);
            table.remove();
        });
    }

    // Qualquer elemento com position:absolute/fixed vindo do CSS original
    // do jogo (ex: banners promocionais animados, pensados pro layout de
    // 990px) fica sem sentido dentro de um card mobile — a posição
    // absoluta original pode empurrar o conteúdo pra cima de outras
    // coisas, causando sobreposição visual. Neutralizamos isso pra
    // qualquer coisa dentro dos nossos cards sempre se comportar como
    // conteúdo normal, em fluxo.
    function neutralizeAbsolutePositioning(container) {
        container.querySelectorAll('*').forEach(el => {
            const pos = getComputedStyle(el).position;
            if (pos === 'absolute' || pos === 'fixed' || pos === 'sticky') {
                el.style.setProperty('position', 'static', 'important');
                el.style.setProperty('top', 'auto', 'important');
                el.style.setProperty('left', 'auto', 'important');
                el.style.setProperty('right', 'auto', 'important');
                el.style.setProperty('bottom', 'auto', 'important');
                el.style.setProperty('transform', 'none', 'important');
            }
        });
    }

    // Marca como "ilustração sozinha" (vira bloco, com margem e cantos
    // arredondados) só as imagens que são o ÚNICO conteúdo do parágrafo/
    // linha onde estão. Ícones pequenos inline (moeda, gota de sangue,
    // separador "·") sempre têm texto ao redor, então NÃO são marcados —
    // continuam fluindo normalmente dentro da frase, como deveriam.
    function markStandaloneImages(container) {
        container.querySelectorAll('img:not([src*="chart"]):not([usemap])').forEach(img => {
            const parent = img.parentElement;
            if (!parent) return;

            const siblingText = Array.from(parent.childNodes)
                .filter(n => n !== img)
                .map(n => n.textContent || '')
                .join('')
                .trim();
            const otherElements = Array.from(parent.children).filter(c => c !== img);

            if (siblingText === '' && otherElements.length === 0) {
                img.classList.add('mg-standalone-img');
            }
        });
    }

    try {
        if (!rebuildContentAsCards()) {
            let rebuildAttempts = 0;
            const rebuildInterval = setInterval(() => {
                try {
                    rebuildAttempts++;
                    if (rebuildContentAsCards() || rebuildAttempts > 20) clearInterval(rebuildInterval);
                } catch (e) { log('erro no retry da seção 4:', e); clearInterval(rebuildInterval); }
            }, 250);
        }
    } catch (e) { log('erro na seção 4 (reconstrução em cards):', e); }

    // =========================================================
    // 5. BARRA DE NAVEGAÇÃO INFERIOR (reconstrói o menu original)
    // =========================================================
    // O menu original (Resumo · Talentos · Mensagens · ... · Logout)
    // vira 2 linhas de texto espremido em mobile. Em vez disso,
    // descobrimos os links reais do menu original (pelo texto),
    // escondemos o menu original e construímos uma barra inferior
    // fixa com os destinos mais usados + um botão "Mais" com o resto.
    // Mapeamento por URL (sempre igual em todos os servidores/idiomas)
    // em vez de texto (que varia por idioma — PT tem "Resumo", DE tem
    // "Übersicht", EN tem "Summary", etc.).
    // Cada entrada: { id único, fragmento de URL que identifica a página,
    //                 ícone SVG path, label PT (usado internamente pra
    //                 chaves de localStorage), isPrimary }
    const NAV_MAP = [
        { id: 'resumo',   url: 'ac=status',           icon: 'Resumo',          primary: true  },
        { id: 'talentos', url: 'ac=accomplishments',  icon: 'Talentos',        primary: false },
        { id: 'msgs',     url: 'ac=nachrichten',       icon: 'Mensagens',       primary: false },
        { id: 'saque',    url: 'ac=raubzug',           icon: 'Saque',           primary: false },
        { id: 'cidade',   url: 'ac=stadt',             icon: 'Cidade',          primary: true  },
        { id: 'escond',   url: 'ac=unterschlupf',      icon: 'Esconderijo',     primary: false },
        { id: 'cla',      url: 'ac=clan',              icon: 'Clã',             primary: true  },
        { id: 'arena',    url: 'ac=arena',             icon: 'Arena',           primary: true  },
        { id: 'objectos', url: 'ac=equipment',         icon: 'Objectos',        primary: false },
        { id: 'templo',   url: 'ac=temple',            icon: 'Templo de Sangue',primary: false },
        { id: 'hiscore',  url: 'ac=highscore',         icon: 'Highscore',       primary: false },
        { id: 'perfil',   url: 'ac=profil',            icon: 'Perfil',          primary: false },
        { id: 'regras',   url: 'ac=anleitung',         icon: 'Regras',          primary: false },
        { id: 'logout',   url: 'ac=logout',            icon: 'Logout',          primary: false },
    ];
    // Para compatibilidade com o código de drag/drop (que usa label como chave)
    // e com o localStorage — usamos o id como chave única.
    const NAV_LABELS = NAV_MAP.map(e => e.id);
    const PRIMARY_LABELS = NAV_MAP.filter(e => e.primary).map(e => e.id);
    // Cada ícone é desenhado à mão em SVG (grade 24x24), reaproveitado
    // nos 3 estilos visuais que o usuário pode escolher.
    // =========================================================
    // 5-i18n. REGIONALIZAÇÃO — detecta o idioma do usuário e mostra os
    // textos que NÓS criamos (botão "Mais", dicas, seletor de ícone)
    // nesse idioma. IMPORTANTE: isso não traduz o conteúdo do próprio
    // jogo (Resumo, Cidade, Talentos etc.) — esses nomes vêm prontos do
    // jogo em português e são usados internamente pra encontrar os links
    // certos, então continuam em português mesmo assim.
    // =========================================================
    const I18N = {
        en: {
            more: 'More',
            dragHint: 'Hold and drag an item to reorganize — you can move it to the bottom bar too',
            iconStyleLabel: 'Icon Style',
            pickerTitle: 'Choose your icon style',
            pickerSubtitle: 'You can change this anytime from the "More" menu.',
            styles: [
                { name: 'Blood Line', tag: 'thin line', desc: 'Fine gold outline, minimalist — like gothic linework.' },
                { name: 'Dark Seal', tag: 'filled badge', desc: 'Solid icon inside a round medallion — bold, seal-like.' },
                { name: 'Ancient Rune', tag: 'rune stone', desc: 'Red carved line inside a hexagonal stone — rugged, ominous.' }
            ]
        },
        pt: {
            more: 'Mais',
            dragHint: 'Segure e arraste um item pra reorganizar — dá pra mover pra barra de baixo também',
            iconStyleLabel: 'Estilo de Ícone',
            pickerTitle: 'Escolha o estilo do ícone',
            pickerSubtitle: 'Você pode trocar isso quando quiser, no menu "Mais".',
            styles: [
                { name: 'Traço de Sangue', tag: 'linha fina', desc: 'Contorno fino dourado, minimalista — como um traço gótico.' },
                { name: 'Selo Sombrio', tag: 'medalhão preenchido', desc: 'Ícone sólido num medalhão redondo — marcante, como um selo.' },
                { name: 'Runa Antiga', tag: 'pedra rúnica', desc: 'Linha vermelha gravada numa pedra hexagonal — rústico, sombrio.' }
            ]
        },
        es: {
            more: 'Más',
            dragHint: 'Mantén pulsado y arrastra un elemento para reorganizar — también puedes moverlo a la barra inferior',
            iconStyleLabel: 'Estilo de icono',
            pickerTitle: 'Elige el estilo de icono',
            pickerSubtitle: 'Puedes cambiarlo cuando quieras desde el menú "Más".',
            styles: [
                { name: 'Línea de Sangre', tag: 'línea fina', desc: 'Contorno fino dorado, minimalista — como grabado gótico.' },
                { name: 'Sello Sombrío', tag: 'insignia rellena', desc: 'Icono sólido dentro de un medallón redondo — audaz, tipo sello.' },
                { name: 'Runa Antigua', tag: 'piedra rúnica', desc: 'Línea roja tallada en una piedra hexagonal — rudo, ominoso.' }
            ]
        },
        de: {
            more: 'Mehr',
            dragHint: 'Halten und ziehen, um neu anzuordnen — kann auch in die untere Leiste verschoben werden',
            iconStyleLabel: 'Symbolstil',
            pickerTitle: 'Wähle deinen Symbolstil',
            pickerSubtitle: 'Du kannst dies jederzeit im Menü "Mehr" ändern.',
            styles: [
                { name: 'Blutlinie', tag: 'dünne Linie', desc: 'Feiner goldener Umriss, minimalistisch — gotische Linienführung.' },
                { name: 'Dunkles Siegel', tag: 'gefülltes Abzeichen', desc: 'Solides Symbol in einem runden Medaillon — kräftig, siegelartig.' },
                { name: 'Alte Rune', tag: 'Runenstein', desc: 'Rote geschnitzte Linie in einem sechseckigen Stein — rau, unheilvoll.' }
            ]
        },
        fr: {
            more: 'Plus',
            dragHint: 'Maintenez et glissez un élément pour réorganiser — déplaçable aussi vers la barre du bas',
            iconStyleLabel: "Style d'icône",
            pickerTitle: "Choisissez votre style d'icône",
            pickerSubtitle: 'Vous pouvez changer cela à tout moment depuis le menu "Plus".',
            styles: [
                { name: 'Ligne de Sang', tag: 'ligne fine', desc: 'Contour doré fin, minimaliste — trait gothique.' },
                { name: 'Sceau Sombre', tag: 'badge plein', desc: 'Icône pleine dans un médaillon rond — audacieux, façon sceau.' },
                { name: 'Rune Antique', tag: 'pierre runique', desc: 'Ligne rouge gravée dans une pierre hexagonale — rugueux, sinistre.' }
            ]
        }
    };

    function detectLang() {
        try {
            const raw = (navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();
            return I18N[raw] ? raw : 'en';
        } catch (e) { return 'en'; }
    }
    const CURRENT_LANG = detectLang();
    function t(key) {
        return (I18N[CURRENT_LANG] && I18N[CURRENT_LANG][key] !== undefined) ? I18N[CURRENT_LANG][key] : I18N.en[key];
    }

    const ICON_PATHS = {
        'Resumo':          '<path d="M4 12 L12 5 L20 12"/><path d="M6 11 V19 H18 V11"/><line x1="10" y1="19" x2="10" y2="14"/><line x1="14" y1="19" x2="14" y2="14"/>',
        'Talentos':        '<path d="M12 3 L19 9 L12 21 L5 9 Z"/><path d="M5 9 H19 M9 9 L12 3 L15 9 M9 9 L12 21 M15 9 L12 21"/>',
        'Mensagens':       '<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3.5 6.8 L12 14 L20.5 6.8"/>',
        'Saque':           '<path d="M9.5 4 H14.5 L17 8 Q19 10.5 19 14.5 Q19 20 12 20 Q5 20 5 14.5 Q5 10.5 7 8 Z"/><line x1="9.5" y1="4" x2="7" y2="8"/><line x1="14.5" y1="4" x2="17" y2="8"/><line x1="9" y1="13" x2="15" y2="13"/>',
        'Cidade':          '<rect x="3.5" y="10" width="6" height="10"/><rect x="13.5" y="4" width="7" height="16"/><line x1="5.5" y1="12.5" x2="7" y2="12.5"/><line x1="5.5" y1="15.5" x2="7" y2="15.5"/><line x1="16" y1="7" x2="17.5" y2="7"/><line x1="16" y1="10" x2="17.5" y2="10"/><line x1="16" y1="13" x2="17.5" y2="13"/>',
        'Esconderijo':     '<path d="M4 20 V12 L12 6 L20 12 V20 Z"/><line x1="4" y1="20" x2="9" y2="14"/><line x1="20" y1="20" x2="15" y2="14"/><line x1="10" y1="20" x2="10" y2="16"/><line x1="14" y1="20" x2="14" y2="16"/>',
        'Clã':             '<path d="M12 3 C16 8.5 18 11.5 18 15 A6 6 0 0 1 6 15 C6 11.5 8 8.5 12 3 Z"/>',
        'Arena':           '<line x1="5" y1="5" x2="16" y2="16"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="5" x2="5" y2="9"/><circle cx="17.5" cy="17.5" r="1.6"/><line x1="19" y1="5" x2="8" y2="16"/><line x1="19" y1="5" x2="15" y2="5"/><line x1="19" y1="5" x2="19" y2="9"/><circle cx="6.5" cy="17.5" r="1.6"/>',
        'Objectos':        '<rect x="5.5" y="9" width="13" height="11" rx="2"/><path d="M9 9 V6 Q9 4 12 4 Q15 4 15 6 V9"/><rect x="9.5" y="12.5" width="5" height="3"/>',
        'Templo de Sangue':'<path d="M7 3.5 H17 L15 10 Q12 12 9 10 Z"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="18" x2="12" y2="20"/><circle cx="12" cy="9" r="1.1"/>',
        'Highscore':       '<path d="M7 4 H17 V9 Q17 14 12 14 Q7 14 7 9 Z"/><path d="M7 5 Q3 5 3 8 Q3 11 7 11"/><path d="M17 5 Q21 5 21 8 Q21 11 17 11"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="18" x2="12" y2="20"/>',
        'Perfil':          '<circle cx="12" cy="8" r="4"/><path d="M4 20 Q4 14 12 14 Q20 14 20 20"/>',
        'Regras':          '<rect x="5.5" y="4.5" width="13" height="15" rx="2"/><line x1="8.5" y1="9" x2="15.5" y2="9"/><line x1="8.5" y1="12" x2="15.5" y2="12"/><line x1="8.5" y1="15" x2="13" y2="15"/>',
        'Logout':          '<path d="M13 4 H6.5 V20 H13"/><line x1="10" y1="12" x2="20" y2="12"/><path d="M16 8 L20 12 L16 16"/>'
    };
    const ICON_STYLE_KEY = 'mg_icon_style';
    // Combina os IDs fixos (a/b/c) com os nomes/descrições traduzidos
    // conforme o idioma detectado.
    function getIconStyles() {
        const ids = ['a', 'b', 'c'];
        const translated = t('styles');
        return ids.map((id, i) => ({ id, ...translated[i] }));
    }

    function getIconStyle() {
        return localStorage.getItem(ICON_STYLE_KEY) || 'a';
    }

    function iconMarkup(label) {
        const style = getIconStyle();
        const path = ICON_PATHS[label] || '<circle cx="12" cy="12" r="7"/>';
        const svg = `<svg viewBox="0 0 24 24" class="mg-icon-svg mg-icon-svg-${style}">${path}</svg>`;
        if (style === 'b') return `<span class="mg-icon-badge mg-icon-badge-b">${svg}</span>`;
        if (style === 'c') return `<span class="mg-icon-badge mg-icon-badge-c">${svg}</span>`;
        return svg;
    }

    // Redesenha todo ícone já na tela (barra de baixo + folha "Mais")
    // sempre que o estilo escolhido mudar, sem precisar recarregar a página.
    function refreshAllIcons() {
        document.querySelectorAll('.mg-nav-icon[data-icon-label]').forEach(el => {
            el.innerHTML = iconMarkup(el.dataset.iconLabel);
        });
    }

    // =========================================================
    // 5a. ESCOLHA DE ESTILO DE ÍCONE (primeira vez + opção "trocar depois")
    // =========================================================
    function openIconStylePicker() {
        if (document.getElementById('mg-icon-picker')) return;

        const overlay = document.createElement('div');
        overlay.id = 'mg-icon-picker';
        overlay.innerHTML = `
            <div class="mg-icon-picker-card">
                <div class="mg-icon-picker-title">${t('pickerTitle')}</div>
                <div class="mg-icon-picker-sub">${t('pickerSubtitle')}</div>
                <div class="mg-icon-picker-options"></div>
            </div>
        `;
        const optionsWrap = overlay.querySelector('.mg-icon-picker-options');

        getIconStyles().forEach(s => {
            const opt = document.createElement('div');
            opt.className = 'mg-icon-picker-option';
            opt.dataset.style = s.id;

            const preview = document.createElement('div');
            preview.className = 'mg-icon-picker-preview';
            ['Resumo', 'Cidade', 'Arena', 'Clã'].forEach(label => {
                const path = ICON_PATHS[label];
                const svg = `<svg viewBox="0 0 24 24" class="mg-icon-svg mg-icon-svg-${s.id}">${path}</svg>`;
                preview.innerHTML += (s.id === 'a') ? svg : `<span class="mg-icon-badge mg-icon-badge-${s.id}">${svg}</span>`;
            });

            opt.innerHTML = `
                <div class="mg-icon-picker-name">${s.name} <span class="mg-icon-picker-tag">${s.tag}</span></div>
            `;
            opt.insertBefore(preview, opt.firstChild);
            const descEl = document.createElement('div');
            descEl.className = 'mg-icon-picker-desc';
            descEl.textContent = s.desc;
            opt.appendChild(descEl);

            opt.addEventListener('click', () => {
                localStorage.setItem(ICON_STYLE_KEY, s.id);
                refreshAllIcons();
                overlay.remove();
            });

            optionsWrap.appendChild(opt);
        });

        document.body.appendChild(overlay);
    }

    // found agora guarda: { id -> { href, label (texto real do jogo), hasNew } }
    function findMainNavLinks() {
        const allLinks = Array.from(document.querySelectorAll('#contentbereich a'));
        const found = {};
        let hasNewMessages = false;

        NAV_MAP.forEach(entry => {
            // Busca por URL (fragmento único — igual em todos os idiomas
            // do jogo: PT, DE, EN, ES...) em vez de texto, que muda por servidor.
            const link = allLinks.find(a => {
                const href = a.getAttribute('href') || '';
                return href.includes(entry.url);
            });
            if (!link) return;

            const rawText = link.textContent.trim();
            found[entry.id] = {
                href: link.getAttribute('href'),
                label: rawText.replace(/\s*\(\d+\)\s*$/, '').trim(), // remove "(3)" de msgs novas
                hasNew: false
            };

            // Detecta mensagens novas por qualquer contador no link de msgs
            if (entry.id === 'msgs') {
                if (/\(\d+\)/.test(rawText)) {
                    hasNewMessages = true;
                    found[entry.id].hasNew = true;
                }
            }
        });

        return { found, hasNewMessages };
    }

    function hideOriginalNav(found) {
        const ids = Object.keys(found);
        if (ids.length < 6) {
            log('menu original não identificado com confiança suficiente, mantendo visível');
            return false;
        }
        // Encontra os elementos <a> pelos hrefs (URL-based, funciona em
        // qualquer idioma do servidor)
        const allLinks = Array.from(document.querySelectorAll('#contentbereich a'));
        const linkEls = ids.map(id => {
            const entry = found[id];
            return allLinks.find(a => (a.getAttribute('href') || '').includes(NAV_MAP.find(e => e.id === id)?.url || ''));
        }).filter(Boolean);

        if (linkEls.length === 0) return false;

        let ancestor = linkEls[0].parentElement;
        let depth = 0;
        while (ancestor && depth < 8) {
            if (linkEls.every(a => ancestor.contains(a))) break;
            ancestor = ancestor.parentElement;
            depth++;
        }
        if (ancestor && linkEls.every(a => ancestor.contains(a))) {
            ancestor.style.display = 'none';
            log('menu original escondido');
            return true;
        }
        log('não encontrou um contêiner seguro para esconder o menu original');
        return false;
    }

    function buildBottomNav(found, hasNewMessages) {
        if (document.getElementById('mg-bottom-nav')) return;

        const style = document.createElement('style');
        style.textContent = `
            #mg-bottom-nav {
                position: fixed;
                left: 0; right: 0; bottom: 0;
                background: linear-gradient(0deg, #1c0505 70%, rgba(28,5,5,0.97));
                border-top: 1px solid #7a1f1f;
                display: flex;
                /* A bolha do moonID agora fica lá em cima (seção 9), não
                   precisa mais reservar espaço extra aqui embaixo — antes
                   isso deixava um vão enorme entre os itens e o "Mais". */
                padding: 6px 4px;
                padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
                z-index: 999999;
            }
            #mg-bottom-nav .mg-nav-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                padding: 6px 2px;
                border-radius: 10px;
                text-decoration: none !important;
                color: #a8917a !important;
            }
            #mg-bottom-nav .mg-nav-item:active { background: rgba(140,20,20,0.25); }
            #mg-bottom-nav .mg-nav-icon { font-size: 17px; line-height: 1; }
            #mg-bottom-nav .mg-nav-label { font-size: 10px; font-family: 'EB Garamond', serif; }

            #mg-nav-sheet-overlay {
                position: fixed;
                top: 0; left: 0; right: 0;
                /* "bottom" é ajustado via JS pra parar exatamente em cima
                   da barra inferior (item 5b) — assim ela continua visível
                   e você pode arrastar um item do "Mais" direto pra lá. */
                bottom: 64px;
                background: rgba(0,0,0,0.6);
                z-index: 999998; /* abaixo da barra inferior (999999), de propósito */
                display: none;
                align-items: flex-end;
            }
            #mg-nav-sheet-overlay.mg-open { display: flex; }
            #mg-nav-sheet {
                width: 100%;
                background: #1a0508;
                border-top: 1px solid #d8b872;
                border-radius: 16px 16px 0 0;
                padding: 10px 8px calc(14px + env(safe-area-inset-bottom,0px));
                max-height: 62%;
                overflow-y: auto;
            }
            #mg-nav-sheet .mg-sheet-handle {
                width: 36px; height: 4px;
                background: #7a1f1f;
                border-radius: 2px;
                margin: 2px auto 12px;
            }
            #mg-nav-sheet .mg-sheet-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                padding: 0 6px;
                min-height: 60px; /* pra sempre ter onde soltar um item, mesmo se ficar vazia */
            }
            /* Mesma classe .mg-nav-item usada na barra de baixo — muda só
               a aparência conforme o contêiner onde está, então um item
               arrastado de um lugar pro outro já nasce com o visual certo,
               sem precisar trocar de elemento. */
            #mg-nav-sheet .mg-nav-item {
                display: flex;
                align-items: center;
                flex-direction: column;
                gap: 6px;
                padding: 12px 4px;
                background: #26090c;
                border: 1px solid #5c1414;
                border-radius: 10px;
                text-decoration: none !important;
                color: #e8d8c0 !important;
                font-family: 'EB Garamond', serif;
                font-size: 11px;
                text-align: center;
            }
            #mg-nav-sheet .mg-nav-icon { font-size: 18px; }
            #mg-nav-sheet .mg-nav-label { font-size: 11px; }
            /* Estado visual enquanto o item está sendo arrastado (tanto
               na barra inferior quanto na folha "Mais") */
            .mg-nav-item.mg-dragging {
                opacity: 0.55;
                transform: scale(1.08);
                z-index: 20;
                box-shadow: 0 0 10px rgba(0,0,0,0.6);
            }
            .mg-nav-item[data-nav-label] {
                touch-action: none; /* evita o navegador roubar o gesto de toque pra rolar a página durante o arraste */
                user-select: none;
                -webkit-user-select: none;
            }
            .mg-sheet-divider {
                height: 1px;
                background: #5c1414;
                margin: 12px 6px 10px;
                opacity: 0.6;
            }
            .mg-sheet-settings-item {
                flex-direction: row !important;
                justify-content: center;
                gap: 8px !important;
                margin: 0 6px;
                cursor: pointer;
            }
            /* ---- Ícones (item 5a): 3 estilos escolhíveis ---- */
            .mg-icon-svg { width: 20px; height: 20px; display: block; }
            .mg-icon-svg-a { fill: none; stroke: #f0d9a0; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
            .mg-icon-badge {
                width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .mg-icon-badge-b {
                border-radius: 50%;
                background: radial-gradient(circle at 35% 30%, #4a1414, #1a0505 75%);
                border: 1.2px solid #d8b872;
            }
            .mg-icon-svg-b { width: 15px; height: 15px; fill: #f0d9a0; stroke: #f0d9a0; stroke-width: 1; }
            .mg-icon-badge-c {
                background: linear-gradient(160deg, #2e2622, #1a1512);
                clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
                border: 1px solid #4a3a2a;
            }
            .mg-icon-svg-c { width: 16px; height: 16px; fill: none; stroke: #c22b2b; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

            /* ---- Modal de escolha de estilo de ícone (item 5a) ---- */
            #mg-icon-picker {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.75);
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .mg-icon-picker-card {
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #d8b872;
                border-radius: 14px;
                padding: 20px 16px;
                max-width: 360px;
                width: 100%;
                max-height: 85vh;
                overflow-y: auto;
            }
            .mg-icon-picker-title {
                font-family: 'Cinzel', Georgia, serif;
                font-size: 17px;
                color: #f0d9a0;
                text-align: center;
                margin-bottom: 4px;
            }
            .mg-icon-picker-sub {
                font-family: 'EB Garamond', serif;
                font-size: 12px;
                color: #a8917a;
                text-align: center;
                margin-bottom: 16px;
            }
            .mg-icon-picker-option {
                background: #26090c;
                border: 1px solid #5c1414;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 10px;
                cursor: pointer;
            }
            .mg-icon-picker-option:active { background: #3a0d0f; }
            .mg-icon-picker-preview {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
            }
            .mg-icon-picker-name {
                font-family: 'Cinzel', Georgia, serif;
                font-size: 13px;
                color: #f0d9a0;
                margin-bottom: 4px;
            }
            .mg-icon-picker-tag {
                font-family: 'EB Garamond', serif;
                font-size: 10px;
                color: #9c7c5c;
                border: 1px solid #5c1414;
                border-radius: 8px;
                padding: 1px 6px;
                margin-left: 4px;
            }
            .mg-icon-picker-desc {
                font-family: 'EB Garamond', serif;
                font-size: 12px;
                color: #c8a882;
                line-height: 1.4;
            }
            .mg-sheet-hint {
                text-align: center;
                font-size: 11px;
                color: #9c7c5c;
                margin: 0 0 10px;
                font-style: italic;
            }
            /* Indicador de mensagem nova no botão "Mais" da barra inferior */
            .mg-nav-badge {
                position: absolute;
                top: 2px;
                right: 14px;
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #ff3b3b;
                border: 1.5px solid #1c0505;
                box-shadow: 0 0 4px rgba(255,59,59,0.8);
                animation: mg-pulse 1.6s infinite;
            }
            @keyframes mg-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.25); opacity: 0.75; }
            }
            /* Destaque do item "Mensagens" dentro da folha "Mais" quando há algo novo */
            .mg-sheet-link-highlight {
                border-color: #ff3b3b !important;
                background: #2e0a0a !important;
            }
            .mg-sheet-badge-dot {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #ff3b3b;
                margin-left: 2px;
                vertical-align: middle;
            }
        `;
        (document.head || document.documentElement).appendChild(style);

        const nav = document.createElement('div');
        nav.id = 'mg-bottom-nav';

        // Usa a organização que o usuário já salvou antes (se houver e
        // se ainda cobrir exatamente os mesmos itens disponíveis hoje),
        // senão usa a divisão padrão. Validamos os dois grupos (barra +
        // "Mais") JUNTOS — não cada um separado com tamanho fixo — porque
        // depois que um item é arrastado de um lugar pro outro, a
        // quantidade de itens em cada grupo muda (ex: barra pode ter 5
        // em vez de 4), e uma checagem de tamanho fixo rejeitaria isso.
        const allFoundLabels = NAV_LABELS.filter(l => found[l]);
        const defaultPrimary = PRIMARY_LABELS.filter(l => found[l]);
        const defaultRest = NAV_LABELS.filter(l => !PRIMARY_LABELS.includes(l) && found[l]);
        const { primary: primaryOrder, rest: restLabels } = loadNavLayout(allFoundLabels, defaultPrimary, defaultRest);

        primaryOrder.forEach(id => {
            if (!found[id]) return;
            const entry = found[id];
            const iconKey = NAV_MAP.find(e => e.id === id)?.icon || id;
            const a = document.createElement('a');
            a.href = entry.href;
            a.className = 'mg-nav-item';
            a.dataset.navLabel = id;
            a.innerHTML = `<span class="mg-nav-icon" data-icon-label="${iconKey}">${iconMarkup(iconKey)}</span><span class="mg-nav-label">${entry.label}</span>`;
            nav.appendChild(a);
        });

        const moreBtn = document.createElement('div');
        moreBtn.className = 'mg-nav-item';
        moreBtn.style.cursor = 'pointer';
        moreBtn.style.position = 'relative';
        moreBtn.innerHTML = `<span class="mg-nav-icon"><svg viewBox="0 0 24 24" class="mg-icon-svg mg-icon-svg-a"><line x1="5" y1="7" x2="19" y2="7"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="17" x2="13" y2="17"/></svg></span><span class="mg-nav-label">${t('more')}</span>${hasNewMessages ? '<span class="mg-nav-badge"></span>' : ''}`;
        moreBtn.addEventListener('click', () => {
            document.getElementById('mg-nav-sheet-overlay').classList.add('mg-open');
        });
        nav.appendChild(moreBtn);

        document.body.appendChild(nav);

        try {
            const statbarStyleFix = document.createElement('style');
            statbarStyleFix.textContent = `#statbar { bottom: ${nav.offsetHeight}px !important; }`;
            (document.head || document.documentElement).appendChild(statbarStyleFix);
        } catch (e) { log('erro ao ajustar #statbar:', e); }

        // Folha deslizante com o restante dos links
        const overlay = document.createElement('div');
        overlay.id = 'mg-nav-sheet-overlay';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('mg-open');
        });

        const sheet = document.createElement('div');
        sheet.id = 'mg-nav-sheet';
        const handle = document.createElement('div');
        handle.className = 'mg-sheet-handle';
        sheet.appendChild(handle);

        const hint = document.createElement('div');
        hint.className = 'mg-sheet-hint';
        hint.textContent = t('dragHint');
        sheet.appendChild(hint);

        const grid = document.createElement('div');
        grid.className = 'mg-sheet-grid';
        restLabels.forEach(id => {
            if (!found[id]) return;
            const entry = found[id];
            const iconKey = NAV_MAP.find(e => e.id === id)?.icon || id;
            const a = document.createElement('a');
            a.href = entry.href;
            a.className = 'mg-nav-item';
            a.dataset.navLabel = id;
            const isNew = id === 'msgs' && hasNewMessages;
            a.innerHTML = `<span class="mg-nav-icon" data-icon-label="${iconKey}">${iconMarkup(iconKey)}</span><span class="mg-nav-label">${entry.label}${isNew ? ' <span class="mg-sheet-badge-dot"></span>' : ''}</span>`;
            if (isNew) a.classList.add('mg-sheet-link-highlight');
            grid.appendChild(a);
        });
        sheet.appendChild(grid);

        const settingsDivider = document.createElement('div');
        settingsDivider.className = 'mg-sheet-divider';
        sheet.appendChild(settingsDivider);

        const settingsItem = document.createElement('div');
        settingsItem.className = 'mg-nav-item mg-sheet-settings-item';
        settingsItem.innerHTML = `<span class="mg-nav-icon"><svg viewBox="0 0 24 24" class="mg-icon-svg mg-icon-svg-a"><circle cx="12" cy="12" r="3"/><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M19.1 4.9 L17 7 M7 17 L4.9 19.1"/></svg></span><span class="mg-nav-label">${t('iconStyleLabel')}</span>`;
        settingsItem.addEventListener('click', () => {
            overlay.classList.remove('mg-open');
            openIconStylePicker();
        });
        sheet.appendChild(settingsItem);

        overlay.appendChild(sheet);
        document.body.appendChild(overlay);

        // Ajusta a folha "Mais" pra parar exatamente em cima da barra
        // inferior (medindo a altura real dela), deixando a barra visível
        // e acessível como alvo de arraste enquanto a folha está aberta.
        overlay.style.bottom = nav.offsetHeight + 'px';

        // Arrastar-e-soltar entre a barra inferior E a folha "Mais" —
        // dá pra puxar um item de um lugar pro outro livremente.
        setupDragAndDrop(nav, grid);

        // Primeira vez que a pessoa usa a versão mobile: pergunta qual
        // estilo de ícone ela prefere.
        if (!localStorage.getItem(ICON_STYLE_KEY)) {
            setTimeout(openIconStylePicker, 600);
        }

        log('barra de navegação inferior criada com', Object.keys(found).length, 'links encontrados');
    }

    // ---- Suporte a arrastar-e-soltar pra reorganizar o menu ----

    // Carrega a organização salva do menu (barra + "Mais"), validando os
    // DOIS grupos JUNTOS: só aceita a versão salva se, somados, eles
    // contiverem exatamente os mesmos itens disponíveis hoje (sem
    // duplicar, sem faltar nenhum) — não importa quantos itens tem em
    // cada grupo individualmente, já que isso muda quando um item é
    // arrastado de um lugar pro outro.
    function loadNavLayout(allFoundLabels, defaultPrimary, defaultRest) {
        try {
            const savedPrimary = JSON.parse(localStorage.getItem('mg_nav_primary_order') || 'null');
            const savedRest = JSON.parse(localStorage.getItem('mg_nav_rest_order') || 'null');
            if (Array.isArray(savedPrimary) && Array.isArray(savedRest)) {
                const combined = [...savedPrimary, ...savedRest];
                const combinedSet = new Set(combined);
                const isValid = combined.length === allFoundLabels.length &&
                    combinedSet.size === combined.length &&
                    allFoundLabels.every(l => combinedSet.has(l));
                if (isValid) return { primary: savedPrimary, rest: savedRest };
            }
        } catch (e) { /* ignora, usa o padrão */ }
        return { primary: defaultPrimary.slice(), rest: defaultRest.slice() };
    }

    function saveOrder(storageKey, order) {
        try { localStorage.setItem(storageKey, JSON.stringify(order)); }
        catch (e) { log('não foi possível salvar a ordem do menu:', e); }
    }

    // Torna os itens de AMBOS os lugares (barra inferior + folha "Mais")
    // arrastáveis entre si: segura ~350ms, arrasta o dedo, e o item pode
    // ser solto tanto reordenando dentro do mesmo lugar quanto migrando
    // pro outro lugar (ex: puxar "Templo de Sangue" do "Mais" pra dentro
    // da barra de baixo). Ao soltar, a nova organização de AMBOS os
    // lugares é salva no localStorage, então continua assim da próxima
    // vez que o jogo abrir.
    function setupDragAndDrop(nav, grid) {
        const ITEM_SEL = '[data-nav-label]';
        let dragEl = null;
        let longPressTimer = null;
        let startX = 0, startY = 0;

        function itemsIn(container) {
            return Array.from(container.querySelectorAll(ITEM_SEL));
        }

        function pointInRect(x, y, rect) {
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }

        function reinsertAt(container, touch) {
            const items = itemsIn(container).filter(i => i !== dragEl);
            for (const sib of items) {
                if (pointInRect(touch.clientX, touch.clientY, sib.getBoundingClientRect())) {
                    const all = itemsIn(container);
                    const dragIndex = dragEl.parentElement === container ? all.indexOf(dragEl) : -1;
                    const sibIndex = all.indexOf(sib);
                    if (dragIndex !== -1 && dragIndex < sibIndex) container.insertBefore(dragEl, sib.nextSibling);
                    else container.insertBefore(dragEl, sib);
                    return;
                }
            }
            // Nenhum item embaixo do dedo, mas ainda dentro do contêiner —
            // garante que pelo menos entrou nele (ex: contêiner vazio)
            if (dragEl.parentElement !== container) container.appendChild(dragEl);
        }

        function persistBoth() {
            saveOrder('mg_nav_primary_order', itemsIn(nav).map(el => el.dataset.navLabel));
            saveOrder('mg_nav_rest_order', itemsIn(grid).map(el => el.dataset.navLabel));
        }

        function onTouchStart(e) {
            const item = e.target.closest(ITEM_SEL);
            if (!item) return;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            longPressTimer = setTimeout(() => {
                dragEl = item;
                item.classList.add('mg-dragging');
                if (navigator.vibrate) navigator.vibrate(25);
            }, 350);
        }

        function onTouchMove(e) {
            if (!dragEl) {
                const touch = e.touches[0];
                if (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10) {
                    clearTimeout(longPressTimer);
                }
                return;
            }
            e.preventDefault();
            const touch = e.touches[0];
            if (pointInRect(touch.clientX, touch.clientY, nav.getBoundingClientRect())) {
                reinsertAt(nav, touch);
            } else if (pointInRect(touch.clientX, touch.clientY, grid.getBoundingClientRect())) {
                reinsertAt(grid, touch);
            }
            // Se o dedo estiver fora dos dois lugares, não faz nada — o
            // item continua onde estava até o dedo voltar pra um dos dois.
        }

        function onTouchEnd() {
            clearTimeout(longPressTimer);
            if (dragEl) {
                dragEl.classList.remove('mg-dragging');
                persistBoth();
                log('nova organização do menu salva');
                dragEl = null;
            }
        }

        [nav, grid].forEach(container => {
            container.addEventListener('touchstart', onTouchStart, { passive: true });
            container.addEventListener('touchmove', onTouchMove, { passive: false });
            container.addEventListener('touchend', onTouchEnd);
            container.addEventListener('touchcancel', onTouchEnd);
        });
    }

    function setupBottomNav() {
        try {
            const { found, hasNewMessages } = findMainNavLinks();
            if (Object.keys(found).length === 0) return false;
            hideOriginalNav(found);
            buildBottomNav(found, hasNewMessages);
            return true;
        } catch (e) {
            log('erro na seção 5 (barra de navegação):', e);
            return true; // não tenta de novo se já deu erro real (evita loop de erro)
        }
    }

    if (!setupBottomNav()) {
        // tenta de novo por alguns segundos, caso o menu apareça depois
        let navAttempts = 0;
        const navInterval = setInterval(() => {
            try {
                navAttempts++;
                if (setupBottomNav() || navAttempts > 20) clearInterval(navInterval);
            } catch (e) { log('erro no retry da seção 5:', e); clearInterval(navInterval); }
        }, 250);
    }

    // =========================================================
    // 6. MAPAS DE IMAGEM CLICÁVEIS (Cidade, Cemitério, Guarda/Combate)
    // =========================================================
    // Várias páginas usam <img usemap="#nome"> com <area coords="x1,y1,x2,y2">
    // fixos em pixels, baseados no tamanho ORIGINAL da imagem. Quando a
    // imagem encolhe pra caber na tela (regra do item 3), as áreas
    // clicáveis não acompanham — ficamts desalinhadas do que é mostrado.
    // Aqui recalculamos as coordenadas proporcionalmente sempre que a
    // imagem for exibida em um tamanho diferente do original.
    function fixImageMaps() {
        try {
            document.querySelectorAll('img[usemap]').forEach(img => {
                if (img.dataset.mgMapFixed === '1') return;
                img.dataset.mgMapFixed = '1';

                function rescale() {
                    try {
                        if (!img.naturalWidth || !img.clientWidth) return;
                        const mapName = (img.getAttribute('usemap') || '').replace('#', '');
                        if (!mapName) return;
                        const map = document.querySelector(`map[name="${mapName}"]`);
                        if (!map) return;

                        const scaleX = img.clientWidth / img.naturalWidth;
                        const scaleY = img.clientHeight / img.naturalHeight;

                        map.querySelectorAll('area').forEach(area => {
                            if (!area.dataset.mgOriginalCoords) {
                                area.dataset.mgOriginalCoords = area.getAttribute('coords') || '';
                            }
                            const orig = area.dataset.mgOriginalCoords.split(',').map(Number);
                            // coordenadas alternam x,y,x,y... (funciona pra shape="rect",
                            // que é o único formato usado no jogo)
                            const scaled = orig.map((v, i) => Math.round(v * (i % 2 === 0 ? scaleX : scaleY)));
                            area.setAttribute('coords', scaled.join(','));
                        });
                        log('mapa de imagem recalculado:', mapName, 'escala', scaleX.toFixed(3));
                    } catch (e) { log('erro ao recalcular mapa de imagem:', e); }
                }

                if (img.complete && img.naturalWidth) rescale();
                img.addEventListener('load', rescale);
                window.addEventListener('resize', () => setTimeout(rescale, 200));
                window.addEventListener('orientationchange', () => setTimeout(rescale, 300));
            });
        } catch (e) { log('erro na seção 6 (mapas de imagem):', e); }
    }
    fixImageMaps();
    // Tenta de novo por alguns segundos, caso a imagem apareça depois
    let mapFixAttempts = 0;
    const mapFixInterval = setInterval(() => {
        mapFixAttempts++;
        fixImageMaps();
        if (mapFixAttempts > 20) clearInterval(mapFixInterval);
    }, 250);

    // =========================================================
    // 7. DETECÇÃO AUTOMÁTICA DE ELEMENTOS MAIS LARGOS QUE A TELA
    // =========================================================
    // Em vez de mapear manualmente cada tabela/menu/barra do jogo,
    // escaneamos a página em busca de elementos "estourando" a
    // largura da tela e os envolvemos num contêiner com scroll.
    function fixOverflowingElements(root) {
        const viewportWidth = document.documentElement.clientWidth;
        // Restrito a <table>: tentar generalizar pra div/ul/form também
        // causava um bug sério — um <div class="mg-card"> que CONTÉM uma
        // tabela larga também tem scrollWidth grande (por causa da
        // tabela lá dentro), então a varredura envolvia o CARD INTEIRO
        // em vez da tabela, e como o card já tem overflow-x:hidden
        // próprio, a tabela ficava presa/cortada sem scroll nenhum.
        // Tabelas são, na prática, a única fonte real de overflow que
        // encontramos até agora (dados demais pra caber em colunas).
        const candidates = root.querySelectorAll('table');

        candidates.forEach(el => {
            if (el.dataset.mgWrapped === '1') return; // já tratado
            if (el.closest('.mg-scroll-wrap')) return; // já está dentro de um wrapper

            // Tabelas costumam ter width="100%" no HTML — isso faz elas
            // encolherem pra caber no "envelope" de scroll (100% de um
            // contêiner agora estreito), esmagando as colunas em vez de
            // manter o tamanho natural e permitir rolar de verdade.
            // Forçamos a largura a ser automática (baseada no conteúdo)
            // ANTES de medir/envolver, pra o scroll horizontal funcionar.
            el.style.setProperty('width', 'auto', 'important');
            el.style.setProperty('min-width', '100%', 'important');

            const width = el.scrollWidth;
            if (width > viewportWidth + 10) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mg-scroll-wrap';
                el.parentNode.insertBefore(wrapper, el);
                wrapper.appendChild(el);
                el.dataset.mgWrapped = '1';

                // Dica visual de que dá pra arrastar pro lado (só aparece
                // uma vez, acima da tabela — a barra de rolagem estilizada
                // já fica sempre visível também)
                const hint = document.createElement('div');
                hint.className = 'mg-scroll-hint';
                hint.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg> Arraste para o lado para ver mais colunas';
                wrapper.parentNode.insertBefore(hint, wrapper);

                log('envolvido em scroll horizontal:', el.tagName, el.className || el.id);
            }
        });
    }

    function runOverflowScan() {
        try {
            fixOverflowingElements(document.body);
        } catch (e) { log('erro na seção 7 (overflow scan):', e); }
    }

    // Roda a varredura assim que possível. Se a página já tiver
    // terminado de carregar (document.readyState === 'complete') antes
    // do nosso script rodar — o que pode acontecer, já que rodamos em
    // document-end e páginas rápidas/cacheadas podem disparar o evento
    // 'load' antes disso — o listener abaixo NUNCA dispararia (o evento
    // já passou). Por isso checamos o estado atual primeiro, e só
    // dependemos do evento como complemento pra quando a página ainda
    // está carregando de verdade.
    function scheduleOverflowScan() {
        runOverflowScan(); // roda já, não espera nada
        if (document.readyState === 'complete') {
            setTimeout(runOverflowScan, 800); // segunda passada, pra imagens/fonts que carregam depois
        } else {
            window.addEventListener('load', () => {
                runOverflowScan();
                setTimeout(runOverflowScan, 800);
            });
        }
    }
    scheduleOverflowScan();

    // Reaplica se a orientação da tela mudar (retrato/paisagem)
    window.addEventListener('orientationchange', () => setTimeout(runOverflowScan, 300));
    window.addEventListener('resize', () => {
        clearTimeout(window.__mgResizeTimer);
        window.__mgResizeTimer = setTimeout(runOverflowScan, 300);
    });

    // =========================================================
    // 8. AJUSTES NOS NOSSOS PRÓPRIOS PAINÉIS (timer, highscore)
    //    para não ficarem grandes/deslocados demais em tela pequena
    // =========================================================
    try {
        const mobilePanelStyle = document.createElement('style');
        mobilePanelStyle.textContent = `
            #mg-attack-timer {
                left: 8px;
                right: 8px;
                bottom: 104px;
                min-width: unset;
                width: auto;
                font-size: 12px;
            }
            #mg-highscore-changes {
                font-size: 11px;
            }
            #mg-highscore-changes table.mg-hs-table {
                font-size: 10px;
            }
        `;
        (document.head || document.documentElement).appendChild(mobilePanelStyle);
    } catch (e) { log('erro na seção 8 (painéis):', e); }

    // =========================================================
    // 8b. MEMO — painel flutuante acessível via botão no statbar
    // =========================================================
    try {
        function setupMemo() {
            const statbar = document.getElementById('statbar');
            if (!statbar || document.getElementById('mg-memo-panel')) return;

            // Encontra o textarea original do memo
            const originalTextarea = statbar.querySelector('textarea') ||
                document.querySelector('#statbarMemoCanvas textarea') ||
                document.querySelector('textarea[name="memo"]');
            if (!originalTextarea) return;

            // Cria botão discreto no statbar pra abrir o memo
            const memoBtn = document.createElement('div');
            memoBtn.className = 'statbarEntry';
            memoBtn.style.cssText = 'cursor:pointer; flex-shrink:0;';
            memoBtn.innerHTML = '📋 Memo';
            statbar.appendChild(memoBtn);

            // Cria o painel flutuante
            const panel = document.createElement('div');
            panel.id = 'mg-memo-panel';
            panel.innerHTML = `
                <span class="mg-memo-close">✕</span>
                <div style="font-family:'Cinzel',serif;font-size:11px;color:#b08060;margin-bottom:6px;text-transform:uppercase;">Memo</div>
            `;

            // Move o textarea original pro painel
            const textarea = originalTextarea.cloneNode(true);
            textarea.style.cssText = '';
            panel.appendChild(textarea);

            // Botão salvar
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.style.cssText = 'margin-top:6px;width:100%;padding:8px;background:#6b1616;color:#ffe4c4;border:1px solid #a02020;border-radius:6px;font-size:13px;cursor:pointer;';
            saveBtn.addEventListener('click', () => {
                // Copia o valor de volta pro textarea original e submete o form pai
                originalTextarea.value = textarea.value;
                const form = originalTextarea.closest('form');
                if (form) form.submit();
                else {
                    // Tenta salvar via fetch se não tiver form
                    const formData = new FormData();
                    formData.append(originalTextarea.name || 'memo', textarea.value);
                    fetch(location.href, { method: 'POST', body: formData }).catch(() => {});
                }
            });
            panel.appendChild(saveBtn);
            document.body.appendChild(panel);

            // Toggle abrir/fechar
            memoBtn.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            });
            panel.querySelector('.mg-memo-close').addEventListener('click', () => {
                panel.style.display = 'none';
            });

            log('memo panel criado');
        }

        setupMemo();
        setTimeout(setupMemo, 1000); // tenta de novo caso statbar ainda não tivesse carregado
    } catch (e) { log('erro na seção 8b (memo):', e); }

    // =========================================================
    // 8c. TALENTOS — corrigir grid de ícones e barras de progresso
    // =========================================================
    try {
        function fixTalentPages() {
            // Envolve tabelas de talentos em scroll horizontal (igual às
            // outras tabelas largas) pra ícones ficarem lado a lado
            document.querySelectorAll('.mg-card-body').forEach(body => {
                body.querySelectorAll('table').forEach(table => {
                    // Detecta se é tabela de talentos: tem imagens pequenas (<= 60px)
                    // em múltiplas células consecutivas
                    const imgs = table.querySelectorAll('img');
                    if (imgs.length < 3) return;
                    const isGrid = Array.from(imgs).every(img =>
                        (parseInt(img.getAttribute('width') || '999') <= 70) ||
                        (img.naturalWidth && img.naturalWidth <= 70)
                    );
                    if (!isGrid) return;
                    if (table.closest('.mg-scroll-wrap')) return;
                    if (table.dataset.mgWrapped === '1') return;

                    const wrap = document.createElement('div');
                    wrap.className = 'mg-scroll-wrap';
                    table.style.setProperty('width', 'auto', 'important');
                    table.parentNode.insertBefore(wrap, table);
                    wrap.appendChild(table);
                    table.dataset.mgWrapped = '1';
                });

                // Barras de progresso de talento (img de barra dentro de td)
                // ficam cortadas — deixamos em scroll também
                body.querySelectorAll('img[src*="bar"], img[src*="progress"], img[src*="fortschritt"]').forEach(img => {
                    if (img.closest('.mg-scroll-wrap')) return;
                    const parent = img.parentElement;
                    if (!parent) return;
                    parent.style.overflowX = 'auto';
                    parent.style.webkitOverflowScrolling = 'touch';
                    img.style.setProperty('max-width', 'none', 'important');
                });
            });
        }

        fixTalentPages();
        setTimeout(fixTalentPages, 800);
    } catch (e) { log('erro na seção 8c (talentos):', e); }

    // =========================================================
    // 8d. OBJECTOS — cards de item com imagem + info lado a lado
    // =========================================================
    try {
        function fixEquipmentPage() {
            document.querySelectorAll('.mg-card-body').forEach(body => {
                body.querySelectorAll('table').forEach(table => {
                    // Detecta tabela de objectos: tem imagem de item numa td
                    // e info (nome, stats) noutra td
                    const rows = table.querySelectorAll('tr');
                    if (rows.length === 0) return;
                    const firstTds = rows[0].querySelectorAll('td');
                    if (firstTds.length < 2) return;
                    if (!firstTds[0].querySelector('img')) return;
                    // Tem imagem na 1ª célula — parece tabela de items
                    if (table.closest('.mg-scroll-wrap')) return;
                    if (table.dataset.mgItemFixed === '1') return;
                    table.dataset.mgItemFixed = '1';

                    // Aplica estilos mobile-friendly direto
                    table.style.width = '100%';
                    rows.forEach(tr => {
                        const tds = tr.querySelectorAll('td');
                        if (tds.length >= 2) {
                            tds[0].style.cssText = 'width:80px;vertical-align:top;padding:4px;';
                            const img = tds[0].querySelector('img');
                            if (img) { img.style.maxWidth = '76px'; img.style.height = 'auto'; img.style.borderRadius = '6px'; }
                            tds[1].style.cssText = 'vertical-align:top;padding:4px;font-size:13px;';
                        }
                    });
                });
            });
        }

        fixEquipmentPage();
        setTimeout(fixEquipmentPage, 800);
    } catch (e) { log('erro na seção 8d (objectos):', e); }

    // =========================================================
    // 8e. ITENS DE CAÇA — grid horizontal de aneis/amuletos
    // =========================================================
    try {
        function fixHuntItems() {
            document.querySelectorAll('.mg-card-body').forEach(body => {
                // Detecta linha de ícones de items de caça: múltiplos <a><img></a>
                // consecutivos sem texto entre eles
                const anchors = Array.from(body.querySelectorAll('a > img, a > img[width]'));
                if (anchors.length < 2) return;

                // Agrupa ícones que são irmãos diretos (filhos do mesmo pai)
                const parents = new Set(anchors.map(img => img.parentElement?.parentElement));
                parents.forEach(parent => {
                    if (!parent) return;
                    if (parent.dataset.mgHuntFixed === '1') return;
                    const childAnchors = Array.from(parent.children).filter(c =>
                        c.tagName === 'A' && c.querySelector('img')
                    );
                    if (childAnchors.length < 2) return;
                    parent.dataset.mgHuntFixed = '1';
                    parent.style.cssText = 'display:flex!important;flex-wrap:wrap!important;gap:8px!important;justify-content:center!important;padding:8px 0!important;';
                    childAnchors.forEach(a => {
                        const img = a.querySelector('img');
                        if (img) { img.style.maxWidth = '52px'; img.style.height = 'auto'; }
                        a.style.display = 'inline-block';
                    });
                });
            });
        }

        fixHuntItems();
        setTimeout(fixHuntItems, 800);
    } catch (e) { log('erro na seção 8e (hunt items):', e); }

    // =========================================================
    // 9. REPOSICIONAR A TOOLBAR MOONID PRO CANTO SUPERIOR DIREITO
    // =========================================================
    // O <iframe> da toolbar (a bolha "ID") normalmente fica fixo no
    // canto inferior direito — que no celular já está ocupado pela
    // nossa barra de navegação. Uma regra CSS sozinha corre o risco de
    // perder pro próprio script da toolbar (moonid.net), que pode
    // reafirmar a posição dele via JS depois de carregar. Por isso
    // fazemos igual fizemos com "manter a toolbar sempre aberta": JS
    // direto no elemento + fica de olho caso ele tente voltar.
    function repositionToolbarIframe() {
        // Busca ampla: qualquer iframe do moonid.net, não só o caminho
        // exato "/toolbar" — caso a URL real seja um pouco diferente do
        // que vimos da última vez que inspecionamos.
        const iframes = Array.from(document.querySelectorAll('iframe[src*="moonid.net"]'));
        if (iframes.length === 0) return false;

        let repositioned = false;
        iframes.forEach(iframe => {
            // Reposiciona o iframe em si E também até 2 níveis de
            // elementos-pai — caso o posicionamento "fixed" de verdade
            // esteja num contêiner ao redor do iframe, não nele mesmo.
            let el = iframe;
            for (let depth = 0; depth < 3 && el; depth++) {
                const cs = getComputedStyle(el);
                if (cs.position === 'fixed' || cs.position === 'absolute' || el === iframe) {
                    el.style.setProperty('top', '8px', 'important');
                    el.style.setProperty('bottom', 'auto', 'important');
                    el.style.setProperty('right', '8px', 'important');
                    el.style.setProperty('left', 'auto', 'important');
                    if (cs.position !== 'fixed' && cs.position !== 'absolute' && el !== iframe) {
                        el.style.setProperty('position', 'fixed', 'important');
                    }
                    repositioned = true;
                }
                el = el.parentElement;
            }
        });
        if (repositioned) log('toolbar moonID reposicionada pro canto superior direito (' + iframes.length + ' iframe(s) encontrado(s))');
        return repositioned;
    }
    try {
        repositionToolbarIframe();

        // A toolbar carrega de forma assíncrona, então tentamos de novo
        // por alguns segundos até ela aparecer no DOM...
        let toolbarAttempts = 0;
        const toolbarInterval = setInterval(() => {
            toolbarAttempts++;
            if (repositionToolbarIframe() || toolbarAttempts > 30) clearInterval(toolbarInterval);
        }, 300);

        // ...e continuamos de olho pra sempre depois disso, reafirmando
        // a posição a cada segundo (não só reagindo a mudanças) — caso o
        // próprio script da toolbar reposicione ele de volta com mais
        // frequência do que o MutationObserver consegue reagir.
        setInterval(repositionToolbarIframe, 500);
        const toolbarObserver = new MutationObserver(() => repositionToolbarIframe());
        toolbarObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } catch (e) { log('erro na seção 9 (reposicionar toolbar):', e); }

    log('shell mobile ativo, largura da tela:', window.innerWidth);

    // =========================================================
    // 10. REMOVER BOTÃO "Switch to mobile version"
    // =========================================================
    // Esse botão aparece porque o jogo detecta que estamos forçando
    // a versão mobile via script, e oferece um botão pra "voltar"
    // pra versão desktop. Como nosso script JÁ É a versão mobile
    // intencional, esse botão é desnecessário e confuso — removemos.
    try {
        function removeSwitchButton() {
            document.querySelectorAll('a, div, p, span').forEach(el => {
                if (el.textContent.trim() === 'Switch to mobile version') {
                    let target = el;
                    // Sobe até achar um contêiner que só contenha esse botão
                    while (target.parentElement &&
                           target.parentElement.children.length === 1 &&
                           target.parentElement.id !== 'maincontent' &&
                           target.parentElement.id !== 'contentbereich') {
                        target = target.parentElement;
                    }
                    target.style.setProperty('display', 'none', 'important');
                    log('botão "Switch to mobile version" removido');
                }
            });
        }
        removeSwitchButton();
        const switchObserver = new MutationObserver(removeSwitchButton);
        switchObserver.observe(document.body, { childList: true, subtree: true });
    } catch (e) { log('erro na seção 10 (switch button):', e); }

    // =========================================================
    // 11. TIMER FLUTUANTE DE SAQUE / TRABALHO
    // =========================================================
    // Quando o personagem está em saque (caça) ou trabalho (cemitério),
    // o jogo mostra em alguma página uma frase do tipo:
    //   "Dentro de 8 minutos, o espólio ... estará disponível aqui."
    //   "Ainda estás num ataque. Tenta novamente dentro de 9 minutos."
    //   "Ainda estás a trabalhar. ... dentro de X minutos."
    // Extraímos esse tempo, criamos um pequeno timer flutuante no canto
    // esquerdo (arrastável, sincronizado ao segundo), que fica em TODAS
    // as páginas até zerar — daí some automaticamente.
    try {
        const TIMER_KEY = 'mg_activity_timer';
        const TIMER_ID = 'mg-activity-timer';

        // CSS do timer
        const timerStyle = document.createElement('style');
        timerStyle.textContent = `
            #${TIMER_ID} {
                position: fixed;
                left: 8px;
                bottom: 120px;
                z-index: 999998;
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #5c1414;
                border-radius: 8px;
                padding: 6px 10px;
                font-family: 'Cinzel', Georgia, serif;
                font-size: 12px;
                color: #f0d9a0;
                cursor: grab;
                user-select: none;
                -webkit-user-select: none;
                touch-action: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                min-width: 70px;
                text-align: center;
            }
            #${TIMER_ID}:active { cursor: grabbing; }
            #${TIMER_ID} .mg-timer-label {
                font-size: 9px;
                color: #b08060;
                display: block;
                margin-bottom: 2px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            #${TIMER_ID} .mg-timer-count {
                font-size: 15px;
                font-weight: 600;
                color: #f0d9a0;
                letter-spacing: 1px;
            }
            #${TIMER_ID}.mg-timer-done { display: none !important; }
        `;
        (document.head || document.documentElement).appendChild(timerStyle);

        function parseActivityTime(text) {
            // Padrão 1: "Dentro de X minutos, ..."  (saque iniciado)
            // Padrão 2: "... dentro de X minutos."  (saque/trabalho em curso, qualquer página)
            // Padrão 3: "Dentro de X horas ..."
            // Aceita: minutos, minuto, horas, hora
            const match = text.match(/dentro de\s+(\d+)\s+(minuto[s]?|hora[s]?)/i);
            if (!match) return null;
            const value = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();
            const seconds = unit.startsWith('hora') ? value * 3600 : value * 60;
            return seconds;
        }

        function scanPageForActivityTimer() {
            // Procura em todo o texto da página por frases de tempo ativo
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const text = node.textContent;
                if (!/dentro de/i.test(text)) continue;
                const seconds = parseActivityTime(text);
                if (seconds && seconds > 0) {
                    const endsAt = Date.now() + seconds * 1000;
                    localStorage.setItem(TIMER_KEY, String(endsAt));
                    log('timer detectado:', seconds, 'segundos restantes');
                    return endsAt;
                }
            }
            return null;
        }

        function loadTimerEndTime() {
            const saved = localStorage.getItem(TIMER_KEY);
            if (!saved) return null;
            const endsAt = parseInt(saved, 10);
            if (isNaN(endsAt) || endsAt <= Date.now()) {
                localStorage.removeItem(TIMER_KEY);
                return null;
            }
            return endsAt;
        }

        function formatTimerMs(ms) {
            const totalSec = Math.max(0, Math.floor(ms / 1000));
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }

        function createTimerEl(labelText) {
            const el = document.createElement('div');
            el.id = TIMER_ID;
            el.innerHTML = `<span class="mg-timer-label">${labelText}</span><span class="mg-timer-count">--:--</span>`;
            document.body.appendChild(el);

            // Posição salva (arrastável)
            const savedPos = JSON.parse(localStorage.getItem('mg_timer_pos') || 'null');
            if (savedPos) {
                el.style.left = savedPos.left;
                el.style.bottom = 'auto';
                el.style.top = savedPos.top;
            }

            // Arrastar via toque
            let startX, startY, origLeft, origTop;
            el.addEventListener('touchstart', e => {
                const touch = e.touches[0];
                const rect = el.getBoundingClientRect();
                startX = touch.clientX;
                startY = touch.clientY;
                origLeft = rect.left;
                origTop = rect.top;
                e.preventDefault();
            }, { passive: false });
            el.addEventListener('touchmove', e => {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const newLeft = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, origLeft + dx));
                const newTop = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, origTop + dy));
                el.style.left = newLeft + 'px';
                el.style.top = newTop + 'px';
                el.style.bottom = 'auto';
                e.preventDefault();
            }, { passive: false });
            el.addEventListener('touchend', () => {
                localStorage.setItem('mg_timer_pos', JSON.stringify({ left: el.style.left, top: el.style.top }));
            });

            return el;
        }

        function startTimer(endsAt, labelText) {
            let timerEl = document.getElementById(TIMER_ID);
            if (!timerEl) timerEl = createTimerEl(labelText);

            const countEl = timerEl.querySelector('.mg-timer-count');
            const labelEl = timerEl.querySelector('.mg-timer-label');
            if (labelEl) labelEl.textContent = labelText;

            function tick() {
                const remaining = endsAt - Date.now();
                if (remaining <= 0) {
                    localStorage.removeItem(TIMER_KEY);
                    timerEl.classList.add('mg-timer-done');
                    return;
                }
                if (countEl) countEl.textContent = formatTimerMs(remaining);
            }
            tick();
            return setInterval(tick, 1000);
        }

        // Detecta o tipo de atividade (saque ou trabalho) pra mostrar
        // o rótulo certo no timer
        function detectActivityLabel() {
            const bodyText = document.body.innerText.toLowerCase();
            if (/espólio|caça/.test(bodyText)) return '⚔ Raid';
            if (/cemitério|trabalhar|trabalho/.test(bodyText)) return '⛏ Work';
            return '⏳ Active';
        }

        // Fluxo principal: primeiro tenta carregar um timer já salvo
        // (de uma página visitada antes), depois varre a página atual
        // pra ver se tem um tempo novo.
        let endsAt = loadTimerEndTime();
        let label = detectActivityLabel();

        if (!endsAt) {
            // Página atual talvez tenha o tempo — varre depois que o
            // conteúdo tiver sido reconstruído em cards
            setTimeout(() => {
                endsAt = scanPageForActivityTimer();
                if (endsAt) {
                    label = detectActivityLabel();
                    startTimer(endsAt, label);
                }
            }, 800);
        } else {
            startTimer(endsAt, label);
        }

    } catch (e) { log('erro na seção 11 (timer de atividade):', e); }

})();
