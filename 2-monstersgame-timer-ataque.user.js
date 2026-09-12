// ==UserScript==
// @name         MonstersGame - Timer de Cooldown de Ataque
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Contador regressivo de cooldown de ataque com detecção automática e notificação (avisa uma única vez por ciclo, mesmo recarregando a página)
// @author       Você
// @match        *://*.monstersgame.moonid.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const DEBUG = false;
    function log(...args) { if (DEBUG) console.log('[MG Timer Ataque]', ...args); }

    const STORAGE_KEY = 'mg_last_attack_ts';
    const NOTIFIED_KEY = 'mg_attack_notified_for_ts'; // guarda para qual ataque já avisamos
    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hora
    const PANEL_ID = 'mg-attack-timer';

    // ---- Estilo ----
    const style = document.createElement('style');
    style.textContent = `
        #${PANEL_ID} {
            position: fixed;
            bottom: 48px;
            right: 16px;
            z-index: 999999;
            background: linear-gradient(180deg, #2a0a0a, #1a0505);
            border: 1px solid #6b1616;
            border-radius: 8px;
            padding: 10px 14px;
            color: #e8c4a0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 13px;
            box-shadow: 0 0 8px rgba(180,20,20,0.5);
            min-width: 190px;
        }
        #${PANEL_ID} .mg-title { font-size: 11px; color: #b08060; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        #${PANEL_ID} .mg-time { font-size: 18px; font-weight: bold; color: #ffdca8; }
        #${PANEL_ID} .mg-ready { color: #7dff7d; }
        #${PANEL_ID} button {
            margin-top: 8px;
            width: 100%;
            background: #6b1616;
            color: #ffe4c4;
            border: 1px solid #a02020;
            border-radius: 4px;
            padding: 5px 8px;
            font-size: 12px;
            cursor: pointer;
            font-family: inherit;
        }
        #${PANEL_ID} button:hover { background: #8a1e1e; }
    `;
    document.head.appendChild(style);

    // ---- Painel ----
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
        <div class="mg-title">Cooldown de ataque</div>
        <div class="mg-time" id="mg-attack-time">--:--:--</div>
        <button id="mg-attack-mark">Marcar manualmente</button>
    `;
    document.body.appendChild(panel);

    document.getElementById('mg-attack-mark').addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        render();
    });

    let notifiedThisCycle = false; // controla dentro da mesma sessão de página (evita duplicar no mesmo carregamento)

    // ---- Detecção automática do clique no botão de Ataque ----
    // O jogo usa um <input type="image" title="Ataque:" alt="Ataque:">
    // dentro de um <form> que envia via POST. Escutamos o clique
    // nesse botão (delegação em document, funciona mesmo se o
    // botão for recriado dinamicamente) e marcamos o horário
    // ANTES do form navegar/recarregar a página.
    document.addEventListener('click', function (e) {
        const target = e.target.closest('input[type="image"]');
        if (!target) return;

        const title = (target.getAttribute('title') || '').trim();
        const alt = (target.getAttribute('alt') || '').trim();

        if (title === 'Ataque:' || alt === 'Ataque:') {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            log('ataque detectado automaticamente, horário marcado');
        }
    }, true);

    function requestNotifPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    requestNotifPermission();

    function playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.15;
            osc.start();
            setTimeout(() => { osc.stop(); ctx.close(); }, 350);
        } catch (e) { log('erro no beep', e); }
    }

    function notifyReady(lastAttackTs) {
        // já avisamos nesta sessão de página?
        if (notifiedThisCycle) return;

        // já avisamos em uma sessão anterior (antes de recarregar) para esse mesmo ataque?
        const alreadyNotifiedTs = localStorage.getItem(NOTIFIED_KEY);
        if (alreadyNotifiedTs === String(lastAttackTs)) {
            notifiedThisCycle = true; // sincroniza a flag em memória também
            return;
        }

        notifiedThisCycle = true;
        localStorage.setItem(NOTIFIED_KEY, String(lastAttackTs));

        playBeep();
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MonstersGame', { body: 'Cooldown de ataque terminou — pode atacar de novo!' });
        }
        document.title = '⚔️ Pronto para atacar! - MonstersGame';
    }

    function formatMs(ms) {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function render() {
        const lastAttack = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        const timeEl = document.getElementById('mg-attack-time');
        if (!timeEl) return;

        if (!lastAttack) {
            timeEl.textContent = 'não marcado';
            timeEl.classList.remove('mg-ready');
            return;
        }

        const elapsed = Date.now() - lastAttack;
        const remaining = COOLDOWN_MS - elapsed;

        if (remaining <= 0) {
            timeEl.textContent = 'Pronto! ⚔️';
            timeEl.classList.add('mg-ready');
            notifyReady(lastAttack);
        } else {
            timeEl.textContent = formatMs(remaining);
            timeEl.classList.remove('mg-ready');
        }
    }

    render();
    setInterval(render, 1000);
})();
