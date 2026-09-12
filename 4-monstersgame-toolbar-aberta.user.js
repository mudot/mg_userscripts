// ==UserScript==
// @name         MonstersGame / moonID - Toolbar sempre aberta
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Mantém a toolbar moonID sempre aberta, mesmo clicando fora — só fecha de verdade pelo botão "×"
// @author       Você
// @match        *://*.moonid.net/*
// @match        *://moonid.net/*
// @match        https://moonid.net/toolbar/v2/frame*
// @match        *://*.monstersgame.moonid.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let closedViaXButton = false;
    let bubbleFound = false;

    function isCollapsed() {
        return document.body && document.body.classList.contains('tb-collapsed');
    }

    function maybeOpen() {
        const bubble = document.getElementById('tb-bubble');
        if (!bubble) return;
        if (isCollapsed() && !closedViaXButton) {
            bubble.click();
        }
    }

    // Marca quando o fechamento foi causado pelo botão "×"
    document.addEventListener('click', function (e) {
        if (e.target.closest('#tb-close')) {
            closedViaXButton = true;
        }
    }, true);

    function attachClassObserver() {
        // A partir daqui, só essa observação decide se reabre ou não —
        // ela sempre respeita a flag closedViaXButton.
        const classObserver = new MutationObserver(() => {
            if (isCollapsed()) {
                if (closedViaXButton) {
                    closedViaXButton = false; // reseta pra próxima vez
                } else {
                    maybeOpen();
                }
            }
        });
        classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function onBubbleFound() {
        if (bubbleFound) return;
        bubbleFound = true;
        maybeOpen();
        structureObserver.disconnect(); // já cumpriu o papel de detectar a criação da toolbar
        attachClassObserver();
    }

    // Observa o documento só até a toolbar ser criada (montagem assíncrona via JS).
    // IMPORTANTE: se deixássemos essa observação rodando pra sempre, ela reagiria
    // a QUALQUER mudança na página inteira e reabriria a toolbar sem checar o clique no X.
    const structureObserver = new MutationObserver(() => {
        if (document.getElementById('tb-bubble')) onBubbleFound();
    });
    structureObserver.observe(document.documentElement, { childList: true, subtree: true });

    if (document.getElementById('tb-bubble')) onBubbleFound();
})();
