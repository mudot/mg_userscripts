// ==UserScript==
// @name         MonstersGame / moonID - Relógio de Berlim
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adiciona um relógio com o horário de Berlim dentro da toolbar moonID
// @author       Ricardo
// @match        *://*.moonid.net/*
// @match        *://moonid.net/*
// @match        https://moonid.net/toolbar/v2/frame*
// @match        *://*.monstersgame.moonid.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const TIMEZONE = 'Europe/Berlin';
    const CLOCK_ID = 'tb-clock';

    function updateClock() {
        const el = document.getElementById('tb-clock-time');
        if (!el) return;
        const now = new Date();
        el.textContent = new Intl.DateTimeFormat('pt-PT', {
            timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).format(now);
    }

    function tryInsertClock() {
        if (document.getElementById(CLOCK_ID)) return true;
        const head = document.getElementById('tb-head');
        const coins = document.getElementById('tb-coins');
        if (!head) return false;

        const style = document.createElement('style');
        style.textContent = `
            #${CLOCK_ID} { display:flex; align-items:center; gap:4px; font-size:inherit; font-family:inherit; color:inherit; white-space:nowrap; margin-left:8px; }
        `;
        document.head.appendChild(style);

        const wrap = document.createElement('span');
        wrap.id = CLOCK_ID;
        wrap.className = 'item'; // reaproveita o hover/estilo dos outros itens da toolbar (My games, Messages...)
        wrap.innerHTML = `<span aria-hidden="true">🕒</span><span id="tb-clock-time">--:--:--</span>`;

        if (coins && coins.parentNode) coins.parentNode.insertBefore(wrap, coins.nextSibling);
        else head.appendChild(wrap);

        updateClock();
        return true;
    }

    const observer = new MutationObserver(() => tryInsertClock());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    tryInsertClock();
    setInterval(updateClock, 1000);
})();
