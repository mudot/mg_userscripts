// ==UserScript==
// @name         MonstersGame - Timer de Cooldown de Ataque Mobile
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Contador regressivo de cooldown de ataque responsivo, arrastável e com detecção automática e notificação
// @author       Ricardo
// @match        *://*.monstersgame.moonid.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const DEBUG = false;

    function log(...args) {
        if (DEBUG) {
            console.log('[MG Timer Ataque]', ...args);
        }
    }

    const STORAGE_KEY = 'mg_last_attack_ts';
    const NOTIFIED_KEY = 'mg_attack_notified_for_ts';
    const POSITION_KEY = 'mg_attack_timer_position';

    const COOLDOWN_MS = 60 * 60 * 1000;
    const PANEL_ID = 'mg-attack-timer';

    const style = document.createElement('style');

    style.textContent = `

        #${PANEL_ID} {
            position: fixed;

            left: 50%;
            top: 70%;

            transform: translate(-50%, -50%);

            z-index: 999999;

            width: clamp(120px, 34vw, 160px);
            min-width: 0;
            max-width: calc(100vw - 12px);

            box-sizing: border-box;

            background: linear-gradient(
                180deg,
                #2a0a0a,
                #1a0505
            );

            border: 1px solid #6b1616;

            border-radius: clamp(5px, 1.8vw, 8px);

            padding: clamp(4px, 1.5vw, 7px);

            color: #e8c4a0;

            font-family:
                Georgia,
                'Times New Roman',
                serif;

            font-size: clamp(9px, 2.6vw, 12px);

            box-shadow:
                0 2px 10px
                rgba(180,20,20,.45);

            user-select: none;

            touch-action: none;

            overflow: hidden;
        }

        #${PANEL_ID}.mg-dragging {
            opacity: .85;
            cursor: grabbing;
        }

        #${PANEL_ID} .mg-timer-head {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: clamp(3px, 1vw, 6px);

            cursor: grab;

            touch-action: none;

            min-width: 0;
        }

        #${PANEL_ID} .mg-title {
            font-size: clamp(7px, 2vw, 10px);

            color: #b08060;

            text-transform: uppercase;

            letter-spacing:
                clamp(.1px, .15vw, .4px);

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

            min-width: 0;
        }

        #${PANEL_ID} .mg-controls {
            display: flex;

            flex: 0 0 auto;

            gap: clamp(2px, .8vw, 4px);
        }

        #${PANEL_ID} .mg-small-button {
            width: clamp(16px, 5vw, 19px);

            height: clamp(16px, 5vw, 19px);

            min-width: clamp(16px, 5vw, 19px);

            min-height: clamp(16px, 5vw, 19px);

            padding: 0;

            margin: 0;

            border:
                1px solid #5c1414;

            border-radius: 4px;

            background: #321010;

            color: #cfa27c;

            font-size:
                clamp(9px, 2.8vw, 11px);

            line-height:
                clamp(14px, 4.5vw, 17px);

            text-align: center;

            cursor: pointer;

            font-family: inherit;

            touch-action: manipulation;
        }

        #${PANEL_ID} .mg-small-button:hover {
            background: #551414;
        }

        #${PANEL_ID} .mg-time {
            text-align: center;

            font-size:
                clamp(13px, 4.2vw, 17px);

            line-height:
                clamp(15px, 4.8vw, 20px);

            font-weight: bold;

            color: #ffdca8;

            white-space: nowrap;

            margin:
                clamp(1px, .6vw, 3px) 0;
        }

        #${PANEL_ID} .mg-ready {
            color: #7dff7d;
        }

        #${PANEL_ID} #mg-attack-mark {
            display: block;

            width: 100%;

            box-sizing: border-box;

            background: #6b1616;

            color: #ffe4c4;

            border:
                1px solid #8d1d1d;

            border-radius: 4px;

            padding:
                clamp(2px, .9vw, 4px)
                clamp(4px, 1.5vw, 7px);

            margin-top:
                clamp(1px, .6vw, 3px);

            font-size:
                clamp(8px, 2.5vw, 10px);

            cursor: pointer;

            font-family: inherit;

            touch-action: manipulation;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
        }

        #${PANEL_ID} #mg-attack-mark:hover {
            background: #8a1e1e;
        }

        @media (max-width: 480px) {

            #${PANEL_ID} {
                width: clamp(
                    120px,
                    34vw,
                    160px
                );
            }

        }

        @media (max-width: 360px) {

            #${PANEL_ID} {
                width: clamp(
                    112px,
                    36vw,
                    145px
                );
            }

            #${PANEL_ID} .mg-time {
                font-size:
                    clamp(
                        12px,
                        4vw,
                        15px
                    );
            }

        }

        @media (max-width: 300px) {

            #${PANEL_ID} {
                width: 112px;
                padding: 4px;
            }

            #${PANEL_ID} .mg-title {
                font-size: 7px;
            }

            #${PANEL_ID} .mg-time {
                font-size: 12px;
            }

            #${PANEL_ID} #mg-attack-mark {
                font-size: 8px;
                padding: 2px 4px;
            }

        }

    `;

    document.head.appendChild(style);

    const panel = document.createElement('div');

    panel.id = PANEL_ID;

    panel.innerHTML = `

        <div
            class="mg-timer-head"
            id="mg-timer-drag"
        >

            <div class="mg-title">
                Cooldown de ataque
            </div>

            <div class="mg-controls">

                <button
                    type="button"
                    class="mg-small-button"
                    id="mg-timer-reset"
                    title="Restaurar posição"
                >
                    ↺
                </button>

                <button
                    type="button"
                    class="mg-small-button"
                    id="mg-timer-close"
                    title="Fechar"
                >
                    ×
                </button>

            </div>

        </div>

        <div
            class="mg-time"
            id="mg-attack-time"
        >
            --:--:--
        </div>

        <button
            id="mg-attack-mark"
            type="button"
        >
            Marcar ataque
        </button>

    `;

    document.body.appendChild(panel);

    const timeEl =
        document.getElementById(
            'mg-attack-time'
        );

    const markButton =
        document.getElementById(
            'mg-attack-mark'
        );

    const dragHandle =
        document.getElementById(
            'mg-timer-drag'
        );

    const resetButton =
        document.getElementById(
            'mg-timer-reset'
        );

    const closeButton =
        document.getElementById(
            'mg-timer-close'
        );

    let notifiedThisCycle = false;

    markButton.addEventListener(
        'click',
        () => {

            localStorage.setItem(
                STORAGE_KEY,
                Date.now().toString()
            );

            notifiedThisCycle = false;

            render();

        }
    );

    document.addEventListener(
        'click',
        function (e) {

            const target =
                e.target.closest(
                    'input[type="image"]'
                );

            if (!target) {
                return;
            }

            const title =
                (
                    target.getAttribute(
                        'title'
                    ) || ''
                ).trim();

            const alt =
                (
                    target.getAttribute(
                        'alt'
                    ) || ''
                ).trim();

            if (
                title === 'Ataque:' ||
                alt === 'Ataque:'
            ) {

                localStorage.setItem(
                    STORAGE_KEY,
                    Date.now().toString()
                );

                notifiedThisCycle = false;

                log(
                    'ataque detectado automaticamente'
                );

            }

        },
        true
    );

    function requestNotifPermission() {

        if (
            'Notification' in window &&
            Notification.permission ===
                'default'
        ) {

            Notification
                .requestPermission()
                .catch(() => {});

        }

    }

    requestNotifPermission();

    function playBeep() {

        try {

            const ctx =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

            const osc =
                ctx.createOscillator();

            const gain =
                ctx.createGain();

            osc.connect(gain);

            gain.connect(
                ctx.destination
            );

            osc.frequency.value = 880;

            gain.gain.value = 0.15;

            osc.start();

            setTimeout(
                () => {

                    try {

                        osc.stop();

                        ctx.close();

                    } catch (e) {}

                },
                350
            );

        } catch (e) {

            log(
                'erro no beep',
                e
            );

        }

    }

    function notifyReady(
        lastAttackTs
    ) {

        if (
            notifiedThisCycle
        ) {
            return;
        }

        const alreadyNotifiedTs =
            localStorage.getItem(
                NOTIFIED_KEY
            );

        if (
            alreadyNotifiedTs ===
            String(lastAttackTs)
        ) {

            notifiedThisCycle = true;

            return;

        }

        notifiedThisCycle = true;

        localStorage.setItem(
            NOTIFIED_KEY,
            String(lastAttackTs)
        );

        playBeep();

        if (
            'Notification' in window &&
            Notification.permission ===
                'granted'
        ) {

            try {

                new Notification(
                    'MonstersGame',
                    {
                        body:
                            'Cooldown de ataque terminou — pode atacar de novo!'
                    }
                );

            } catch (e) {}

        }

        document.title =
            '⚔️ Pronto para atacar! - MonstersGame';

    }

    function formatMs(ms) {

        const totalSec =
            Math.max(
                0,
                Math.floor(
                    ms / 1000
                )
            );

        const h =
            String(
                Math.floor(
                    totalSec / 3600
                )
            ).padStart(
                2,
                '0'
            );

        const m =
            String(
                Math.floor(
                    (totalSec % 3600) /
                    60
                )
            ).padStart(
                2,
                '0'
            );

        const s =
            String(
                totalSec % 60
            ).padStart(
                2,
                '0'
            );

        return `${h}:${m}:${s}`;

    }

    function render() {

        if (!timeEl) {
            return;
        }

        const lastAttack =
            parseInt(
                localStorage.getItem(
                    STORAGE_KEY
                ) || '0',
                10
            );

        if (!lastAttack) {

            timeEl.textContent =
                'não marcado';

            timeEl.classList.remove(
                'mg-ready'
            );

            return;

        }

        const elapsed =
            Date.now() -
            lastAttack;

        const remaining =
            COOLDOWN_MS -
            elapsed;

        if (
            remaining <= 0
        ) {

            timeEl.textContent =
                'Pronto! ⚔️';

            timeEl.classList.add(
                'mg-ready'
            );

            notifyReady(
                lastAttack
            );

        } else {

            timeEl.textContent =
                formatMs(
                    remaining
                );

            timeEl.classList.remove(
                'mg-ready'
            );

        }

    }

    function applyPosition(
        x,
        y
    ) {

        const rect =
            panel.getBoundingClientRect();

        const maxX =
            Math.max(
                4,
                window.innerWidth -
                rect.width -
                4
            );

        const maxY =
            Math.max(
                4,
                window.innerHeight -
                rect.height -
                4
            );

        x =
            Math.max(
                4,
                Math.min(
                    x,
                    maxX
                )
            );

        y =
            Math.max(
                4,
                Math.min(
                    y,
                    maxY
                )
            );

        panel.style.left =
            `${x}px`;

        panel.style.top =
            `${y}px`;

        panel.style.right =
            'auto';

        panel.style.bottom =
            'auto';

        panel.style.transform =
            'none';

    }

    function savePosition(
        x,
        y
    ) {

        localStorage.setItem(
            POSITION_KEY,
            JSON.stringify({
                x,
                y
            })
        );

    }

    function loadPosition() {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem(
                        POSITION_KEY
                    ) || 'null'
                );

            if (
                !data ||
                !Number.isFinite(data.x) ||
                !Number.isFinite(data.y)
            ) {

                return false;

            }

            applyPosition(
                data.x,
                data.y
            );

            return true;

        } catch (e) {

            return false;

        }

    }

    function resetPosition() {

        localStorage.removeItem(
            POSITION_KEY
        );

        panel.style.left =
            '50%';

        panel.style.top =
            '70%';

        panel.style.right =
            'auto';

        panel.style.bottom =
            'auto';

        panel.style.transform =
            'translate(-50%, -50%)';

    }

    let dragging = false;

    let pointerId = null;

    let offsetX = 0;

    let offsetY = 0;

    function startDrag(e) {

        if (
            e.target.closest(
                'button'
            )
        ) {

            return;

        }

        dragging = true;

        pointerId =
            e.pointerId;

        const rect =
            panel.getBoundingClientRect();

        offsetX =
            e.clientX -
            rect.left;

        offsetY =
            e.clientY -
            rect.top;

        panel.classList.add(
            'mg-dragging'
        );

        try {

            dragHandle.setPointerCapture(
                pointerId
            );

        } catch (err) {}

        e.preventDefault();

    }

    function moveDrag(e) {

        if (
            !dragging ||
            e.pointerId !==
                pointerId
        ) {

            return;

        }

        const x =
            e.clientX -
            offsetX;

        const y =
            e.clientY -
            offsetY;

        applyPosition(
            x,
            y
        );

        e.preventDefault();

    }

    function endDrag(e) {

        if (!dragging) {
            return;
        }

        if (
            pointerId !== null &&
            e.pointerId !==
                pointerId
        ) {

            return;

        }

        dragging = false;

        panel.classList.remove(
            'mg-dragging'
        );

        const rect =
            panel.getBoundingClientRect();

        savePosition(
            rect.left,
            rect.top
        );

        try {

            dragHandle.releasePointerCapture(
                pointerId
            );

        } catch (err) {}

        pointerId = null;

    }

    dragHandle.addEventListener(
        'pointerdown',
        startDrag
    );

    dragHandle.addEventListener(
        'pointermove',
        moveDrag
    );

    dragHandle.addEventListener(
        'pointerup',
        endDrag
    );

    dragHandle.addEventListener(
        'pointercancel',
        endDrag
    );

    resetButton.addEventListener(
        'click',
        resetPosition
    );

    closeButton.addEventListener(
        'click',
        () => {

            panel.style.display =
                'none';

        }
    );

    window.addEventListener(
        'resize',
        () => {

            if (
                panel.style.display ===
                'none'
            ) {

                return;

            }

            const rect =
                panel.getBoundingClientRect();

            applyPosition(
                rect.left,
                rect.top
            );

            savePosition(
                parseFloat(
                    panel.style.left
                ),
                parseFloat(
                    panel.style.top
                )
            );

        }
    );

    if (!loadPosition()) {
        resetPosition();
    }

    render();

    setInterval(
        render,
        1000
    );

})();
