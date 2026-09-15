// ==UserScript==
// @name         MonstersGame - Shell Mobile
// @namespace    http://tampermonkey.net/
// @version      5.17
// @description  Interface mobile para MonstersGame (v5.17)
// @author       Você
// @match        *://*.monstersgame.moonid.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    console.log('[MG Mobile] script injetado, largura da janela:', window.innerWidth, 'em', location.href);

    const MOBILE_BREAKPOINT = 820;
    function isMobileViewport() {
        const screenWidth = window.screen && window.screen.width ? window.screen.width : Infinity;
        const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent || '');
        const smallWidth = Math.min(window.innerWidth, screenWidth) <= MOBILE_BREAKPOINT;
        return isMobileUA || smallWidth;
    }

    if (!isMobileViewport()) {
        console.log('[MG Mobile] largura acima do breakpoint (' + MOBILE_BREAKPOINT + 'px) e user-agent não é mobile, script não vai ativar o modo mobile.');
        return; 
    }

    const DEBUG = true;
    function log(...args) { if (DEBUG) console.log('[MG Mobile]', ...args); }

    log('script mobile carregado, largura da tela:', window.innerWidth, 'em', location.href);

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
        const widthFixObserver = new MutationObserver(() => fixFixedWidthContainer());
        widthFixObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    } catch (e) { log('erro na seção 2 (largura fixa):', e); }

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
            
            #contentbereich > div[style*="990px"] {
                width: 100% !important;
                max-width: 990px !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            }
            
            #header {
                display: none !important;
            }
            
            a, button, input[type="submit"], input[type="image"] {
                min-height: 30px;
            }
            
            img:not([src*="chart"]) {
                max-width: 100% !important;
                height: auto !important;
            }
            
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
            
            .mg-card-link-wrap {
                padding: 0 !important;
                background: linear-gradient(180deg, #2a0a0a, #1a0505) !important;
                overflow: hidden; 
            }
            .mg-card-link-wrap > a {
                display: block;
                text-decoration: none !important;
            }

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
                
                max-width: 100%;
                overflow-x: hidden;
                box-sizing: border-box;
            }
            .mg-card * { box-sizing: border-box; max-width: 100%; }
            .mg-card table { max-width: none; } 
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
            .mg-loot-row {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 10px !important;
                padding: 10px 4px !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                text-align: center !important;
            }
            .mg-loot-row img {
                width: 48px !important;
                height: auto !important;
                max-width: 100% !important;
            }
            .mg-card.mg-card-plain {
                
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #5c1414;
            }
            
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
            
            .mg-standalone-img {
                display: block !important;
                max-width: 100% !important;
                height: auto !important;
                margin: 8px 0 !important;
                border-radius: 8px;
            }
            
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

            
            #statbar .statbarMemo,
            #statbarMemoCanvas {
                display: none !important; 
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

            .mg-item-list { width: 100%; }
            .mg-item-card {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                padding: 10px 0;
                border-bottom: 1px solid rgba(92,20,20,0.35);
            }
            .mg-item-list .mg-item-card:last-child { border-bottom: none; }
            .mg-item-image {
                flex: 0 0 auto;
                width: 72px;
                text-align: center;
            }
            .mg-item-image img {
                max-width: 68px !important;
                height: auto !important;
                border-radius: 6px;
                border: 1px solid #5c1414;
            }
            .mg-item-info {
                flex: 1 1 auto;
                min-width: 0;
                font-size: 13.5px;
                line-height: 1.55;
                color: #e8d8c0;
            }
            .mg-item-info b.big {
                display: block;
                font-family: 'Cinzel', Georgia, serif;
                font-size: 14.5px;
                font-weight: 600;
                color: #f0d9a0;
                margin-bottom: 3px;
            }
            .mg-item-info a {
                color: #e07070 !important;
                text-decoration: none;
                display: inline-block;
                margin-top: 4px;
            }
            
            .mg-item-fallback-row {
                padding: 6px 0;
                font-size: 13px;
                color: #b08060;
                text-align: center;
                border-bottom: 1px solid rgba(92,20,20,0.35);
            }

            
            
            .mg-card-body .all_acmp_container,
            .mg-card-body .all_acmp_container * {
                max-width: 100% !important;
                box-sizing: border-box !important;
            }
            .mg-card-body .all_acmp_container {
                position: static !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                float: none !important;
                margin: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow: visible !important;
            }
            .mg-card-body .inactive_acmps {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 8px !important;
                padding: 6px 0 !important;
                position: static !important;
                margin-top: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
            }
            .mg-card-body .inactive_acmps .acmp_row {
                display: contents !important;
            }
            .mg-card-body .acmp_row.bottom { display: none !important; }
            .mg-card-body .inactive_acmps img.thumb_acmp,
            .mg-card-body #active_set_container img.thumb_acmp,
            .mg-card-body .acmp_title_thumb img,
            .mg-card-body .acmp_trash_thumb img {
                width: 44px !important;
                height: 44px !important;
                max-width: 44px !important;
                border-radius: 6px;
                background: #1a0508;
                border: 1px solid #5c1414;
                padding: 2px;
                box-sizing: border-box;
            }
            .mg-card-body #set_container,
            .mg-card-body .mg-set-grid {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                align-items: stretch !important;
                gap: 6px !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                padding: 4px 0 !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
                white-space: normal !important;
                float: none !important;
                position: static !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                background: none !important;
                background-image: none !important;
            }
            .mg-card-body .set_select,
            .mg-card-body .mg-set-grid > * {
                display: flex !important;
                align-items: center;
                justify-content: center;
                flex: 0 1 auto !important;
                min-width: 0 !important;
                width: auto !important;
                max-width: 100% !important;
                float: none !important;
                position: static !important;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                background: #26090c;
                border: 1px solid #5c1414;
                border-radius: 14px;
                padding: 7px 8px;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
                color: #e8d8c0;
                cursor: pointer;
                box-sizing: border-box;
                background-image: none !important;
            }
            .mg-card-body .set_select.active_set { border-color: #d8b872; color: #f0d9a0; }
            .mg-card-body .set_select.selected_set { background: #3a0d0d; }
            
            .mg-card-body .mg-active-grid,
            .mg-card-body #active_set_container,
            .mg-card-body #active_acmp_container,
            .mg-card-body .acmp_overview,
            .mg-card-body .acmp_overview_selected,
            .mg-card-body .active_acmps {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 6px !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                background: none !important;
                background-image: none !important;
                position: static !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                float: none !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow: visible !important;
            }
            .mg-card-body .mg-active-grid > *,
            .mg-card-body .mg-active-grid img,
            .mg-card-body #active_set_container *,
            .mg-card-body #active_acmp_container *,
            .mg-card-body .acmp_overview * {
                background-image: none !important;
                float: none !important;
                position: static !important;
            }
            .mg-card-body .acmp_overview_thumb,
            .mg-card-body .mg-active-grid > *,
            .mg-card-body #active_set_container .thumb_acmp,
            .mg-card-body .mg-slot-empty {
                flex: 0 0 auto !important;
                width: 52px !important;
                max-width: 52px !important;
                aspect-ratio: 1 / 1;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
            }
            .mg-card-body .acmp_overview_thumb {
                display: flex !important;
                align-items: center;
                justify-content: center;
                border: 1px solid #5c1414;
                border-radius: 8px;
                background: #1a0508;
                overflow: hidden;
            }
            .mg-card-body .acmp_overview_thumb img,
            .mg-card-body .mg-active-grid img,
            .mg-card-body #active_set_container img.thumb_acmp {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                object-fit: contain;
                display: block !important;
                border: none !important;
                border-radius: 7px !important;
                padding: 2px !important;
                margin: 0 !important;
                background: transparent !important;
                box-sizing: border-box !important;
            }
            .mg-card-body .mg-slot-empty {
                border: 1px dashed #7a1f1f;
                border-radius: 8px;
                background: #1a0508;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #a05050;
                font-family: 'Cinzel', Georgia, serif;
                font-size: 18px;
                font-weight: 600;
            }
            .mg-card-body .acmp_title_thumb,
            .mg-card-body .acmp_trash_thumb {
                display: inline-block;
                margin: 2px 8px 8px 0;
                position: static !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                float: none !important;
            }
            
            .mg-card-body .preview,
            .mg-card-body .acmp_overview_selected_left {
                float: none !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                margin-top: 10px !important;
                padding-top: 10px !important;
                border-top: 1px solid #5c1414;
                text-align: center;
                
                position: static !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                z-index: auto !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow: visible !important;
            }
            .mg-card-body #preview_image {
                max-width: 140px !important;
                border-radius: 8px;
                margin: 0 auto;
            }
            .mg-card-body .acmp_image_info {
                font-size: 13px;
                line-height: 1.5;
                color: #e8d8c0;
            }

            .mg-talent-progress-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .mg-talent-progress-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 0;
                border-bottom: 1px solid rgba(92,20,20,0.35);
            }
            .mg-talent-progress-row:last-child { border-bottom: none; }
            .mg-talent-progress-icon {
                flex: 0 0 auto;
            }
            .mg-talent-progress-icon img {
                width: 44px !important;
                height: 44px !important;
                max-width: 44px !important;
                border-radius: 6px;
                background: #1a0508;
                border: 1px solid #5c1414;
                padding: 2px;
                box-sizing: border-box;
            }
            .mg-talent-progress-bar-wrap {
                flex: 1 1 auto;
                min-width: 0;
            }
            .mg-talent-progress-track {
                width: 100%;
                height: 12px;
                background: #1a0508;
                border: 1px solid #5c1414;
                border-radius: 6px;
                overflow: hidden;
                box-sizing: border-box;
            }
            .mg-talent-progress-fill {
                height: 100%;
                min-width: 2px;
                background: linear-gradient(90deg, #7a1f1f, #d8b872);
                border-radius: 6px 0 0 6px;
            }
            .mg-talent-progress-label {
                margin-top: 4px;
                font-size: 12px;
                color: #b08060;
                text-align: right;
            }
            
            #acmp_progress_container_top,
            #acmp_progress_container_bottom {
                display: none !important;
            }
            
            #acmp_progress { width: 100% !important; }
            #acmp_progress td.acmp_progress_divider { display: none !important; }
            #acmp_progress tr { display: flex !important; align-items: center; gap: 10px; }
            #acmp_progress td.acmp_progress_bar { flex: 1 1 auto; }

            
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
            
            .mg-card-body > div > a > img[width="40"],
            .mg-card-body > a > img[width="40"] {
                margin: 4px;
            }

            #footer { display: none !important; }
            .copyline {
                font-size: 10px !important;
                opacity: 0.55;
                text-align: center;
                padding: 6px 14px 100px !important;
                line-height: 1.6;
            }
            
            .mg-scroll-wrap {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                max-width: 100vw;
                position: relative;
                
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

            #contentbereich {
                padding-bottom: 120px !important;
                
                background: #19030f !important;
                background-image: none !important;
            }
        `;
        (document.head || document.documentElement).appendChild(baseStyle);
    } catch (e) { log('erro na seção 3 (CSS base):', e); }

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
        if (children.length === 0) return false; 

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
                statbarEl = el; 
                i++;
                continue;
            }

            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') {
                i++;
                continue;
            }

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

                if (isSubnav && !addedBody) card.style.paddingBottom = '8px';

                newContainer.appendChild(card);
                i = j;
            } else if (classList.includes('clr')) {
                i++; 
            } else if (el.tagName === 'FORM') {
                forceBoxReset(el);
                el.querySelectorAll('.headerRow, .headerRowSC, .headerRowC, .pageContent, .pageContentC').forEach(forceBoxReset);

                el.querySelectorAll('.headerRow, .headerRowSC, .headerRowC').forEach(h => h.classList.add('mg-card-title'));
                el.querySelectorAll('.pageContent, .pageContentC').forEach(p => p.classList.add('mg-card-body'));

                const card = document.createElement('div');
                card.className = 'mg-card mg-card-form';
                card.appendChild(el); 
                newContainer.appendChild(card);
                i++;
            } else if (el.tagName === 'A' && el.children.length > 0) {
                const card = document.createElement('div');
                card.className = 'mg-card mg-card-plain mg-card-link-wrap';
                card.appendChild(el);
                newContainer.appendChild(card);
                i++;
            } else {
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
        maincontent.remove(); 

        if (!statbarEl) statbarEl = document.getElementById('statbar');

        if (statbarEl && statbarEl.parentElement !== document.body) {
            document.body.appendChild(statbarEl);
        }

        restructureSimpleTables(newContainer);
        markStandaloneImages(newContainer);
        neutralizeAbsolutePositioning(newContainer);

        log('conteúdo reconstruído em', newContainer.children.length, 'cards');
        return true;
    }

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
                const cell = cells[0];
                const hasImg = cell.querySelector('img');
                const text = cell.textContent.trim();
                const box = document.createElement('div');
                box.className = hasImg && !text ? 'mg-vs-portrait' : 'mg-vs-name';
                while (cell.firstChild) box.appendChild(cell.firstChild);
                side.appendChild(box);
            } else {
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

            if (cells.length === 1 && parseInt(cells[0].getAttribute('colspan') || '1', 10) >= 4) return;

            let cum = 0;
            const leftCells = [], rightCells = [];
            cells.forEach(cell => {
                const span = parseInt(cell.getAttribute('colspan') || '1', 10);
                const start = cum;
                cum += span;
                if (start < 2) leftCells.push(cell);
                else if (start >= 3) rightCells.push(cell);
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

    function restructureEquipmentTable(table) {
        const rows = Array.from(table.children).find(c => c.tagName === 'TBODY')
            ? Array.from(table.querySelector('tbody').children).filter(c => c.tagName === 'TR')
            : Array.from(table.children).filter(c => c.tagName === 'TR');

        const list = document.createElement('div');
        list.className = 'mg-item-list';

        rows.forEach(tr => {
            const cells = Array.from(tr.children).filter(c => c.tagName === 'TD' || c.tagName === 'TH');
            if (cells.length === 0) return;
            if (cells.length === 1) return;

            if (!cells[0].querySelector('img')) {
                const fallback = document.createElement('div');
                fallback.className = 'mg-item-fallback-row';
                cells.forEach(c => { while (c.firstChild) fallback.appendChild(c.firstChild); });
                list.appendChild(fallback);
                return;
            }

            const card = document.createElement('div');
            card.className = 'mg-item-card';

            const imgWrap = document.createElement('div');
            imgWrap.className = 'mg-item-image';
            while (cells[0].firstChild) imgWrap.appendChild(cells[0].firstChild);
            card.appendChild(imgWrap);

            const infoWrap = document.createElement('div');
            infoWrap.className = 'mg-item-info';
            for (let k = 1; k < cells.length; k++) {
                while (cells[k].firstChild) infoWrap.appendChild(cells[k].firstChild);
            }
            card.appendChild(infoWrap);

            list.appendChild(card);
        });

        table.parentNode.insertBefore(list, table);
        table.remove();
    }

    function restructureTalentProgressTable(table) {
        const rows = Array.from(table.children).find(c => c.tagName === 'TBODY')
            ? Array.from(table.querySelector('tbody').children).filter(c => c.tagName === 'TR')
            : Array.from(table.children).filter(c => c.tagName === 'TR');

        const list = document.createElement('div');
        list.className = 'mg-talent-progress-list';

        rows.forEach(tr => {
            const iconCell = tr.querySelector('td:first-child');
            const barCell = tr.querySelector('td.acmp_progress_bar');
            if (!iconCell || !barCell) return; 

            const barImg = barCell.querySelector('img[alt*="%"], img[title*="%"]');
            const rawText = barImg ? (barImg.getAttribute('alt') || barImg.getAttribute('title') || '') : '';
            const match = rawText.match(/(\d+(?:[.,]\d+)?)\s*%/);
            const percent = match ? Math.max(0, Math.min(100, parseFloat(match[1].replace(',', '.')))) : 0;

            const row = document.createElement('div');
            row.className = 'mg-talent-progress-row';

            const iconWrap = document.createElement('div');
            iconWrap.className = 'mg-talent-progress-icon';
            while (iconCell.firstChild) iconWrap.appendChild(iconCell.firstChild);

            const barWrap = document.createElement('div');
            barWrap.className = 'mg-talent-progress-bar-wrap';

            const track = document.createElement('div');
            track.className = 'mg-talent-progress-track';
            const fill = document.createElement('div');
            fill.className = 'mg-talent-progress-fill';
            fill.style.width = percent + '%';
            track.appendChild(fill);

            const label = document.createElement('div');
            label.className = 'mg-talent-progress-label';
            label.textContent = rawText || '';

            barWrap.appendChild(track);
            barWrap.appendChild(label);

            row.appendChild(iconWrap);
            row.appendChild(barWrap);
            list.appendChild(row);
        });

        table.parentNode.insertBefore(list, table);
        table.remove();
    }

    function restructureSimpleTables(container) {
        container.querySelectorAll('table').forEach(table => {
            const rows = Array.from(table.children).find(c => c.tagName === 'TBODY')
                ? Array.from(table.querySelector('tbody').children).filter(c => c.tagName === 'TR')
                : Array.from(table.children).filter(c => c.tagName === 'TR');
            if (rows.length === 0) return;

            if (table.querySelector('td > b.big, td b.big')) {
                restructureEquipmentTable(table);
                return;
            }

            if (table.id === 'acmp_progress' || table.querySelector('td.acmp_progress_bar')) {
                restructureTalentProgressTable(table);
                return;
            }

            let maxCols = 0;
            rows.forEach(tr => {
                let cols = 0;
                Array.from(tr.children).forEach(cell => {
                    cols += parseInt(cell.getAttribute('colspan') || '1', 10);
                });
                if (cols > maxCols) maxCols = cols;
            });
            if (maxCols === 5 && tableHasVsMarker(table)) {
                restructureVsComparisonTable(table, rows);
                return;
            }
            if (maxCols < 2 || maxCols > 3) return; 

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

    try {
        function ensureStatbarDocked() {
            const bar = document.getElementById('statbar');
            if (bar && bar.parentElement !== document.body) {
                document.body.appendChild(bar);
            }
        }
        ensureStatbarDocked();
        setTimeout(ensureStatbarDocked, 500);
        setTimeout(ensureStatbarDocked, 1500);
    } catch (e) { log('erro na rede de segurança do #statbar:', e); }

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
    const NAV_LABELS = NAV_MAP.map(e => e.id);
    const PRIMARY_LABELS = NAV_MAP.filter(e => e.primary).map(e => e.id);
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

    function refreshAllIcons() {
        document.querySelectorAll('.mg-nav-icon[data-icon-label]').forEach(el => {
            el.innerHTML = iconMarkup(el.dataset.iconLabel);
        });
    }

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

    function findMainNavLinks() {
        const allLinks = Array.from(document.querySelectorAll('#contentbereich a'));
        const found = {};
        let hasNewMessages = false;

        NAV_MAP.forEach(entry => {
            const link = allLinks.find(a => {
                const href = a.getAttribute('href') || '';
                return href.includes(entry.url);
            });
            if (!link) return;

            const rawText = link.textContent.trim();
            found[entry.id] = {
                href: link.getAttribute('href'),
                label: rawText.replace(/\s*\(\d+\)\s*$/, '').trim(), 
                hasNew: false
            };

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
                
                bottom: 64px;
                background: rgba(0,0,0,0.6);
                z-index: 999998; 
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
                min-height: 60px; 
            }
            
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
            
            .mg-nav-item.mg-dragging {
                opacity: 0.55;
                transform: scale(1.08);
                z-index: 20;
                box-shadow: 0 0 10px rgba(0,0,0,0.6);
            }
            .mg-nav-item[data-nav-label] {
                touch-action: none; 
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

        overlay.style.bottom = nav.offsetHeight + 'px';

        setupDragAndDrop(nav, grid);

        if (!localStorage.getItem(ICON_STYLE_KEY)) {
            setTimeout(openIconStylePicker, 600);
        }

        log('barra de navegação inferior criada com', Object.keys(found).length, 'links encontrados');
    }

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
        } catch (e) {  }
        return { primary: defaultPrimary.slice(), rest: defaultRest.slice() };
    }

    function saveOrder(storageKey, order) {
        try { localStorage.setItem(storageKey, JSON.stringify(order)); }
        catch (e) { log('não foi possível salvar a ordem do menu:', e); }
    }

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
            return true; 
        }
    }

    if (!setupBottomNav()) {
        let navAttempts = 0;
        const navInterval = setInterval(() => {
            try {
                navAttempts++;
                if (setupBottomNav() || navAttempts > 20) clearInterval(navInterval);
            } catch (e) { log('erro no retry da seção 5:', e); clearInterval(navInterval); }
        }, 250);
    }

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
    let mapFixAttempts = 0;
    const mapFixInterval = setInterval(() => {
        mapFixAttempts++;
        fixImageMaps();
        if (mapFixAttempts > 20) clearInterval(mapFixInterval);
    }, 250);

    function fixOverflowingElements(root) {
        const viewportWidth = document.documentElement.clientWidth;
        const candidates = root.querySelectorAll('table');

        candidates.forEach(el => {
            if (el.dataset.mgWrapped === '1') return; 
            if (el.closest('.mg-scroll-wrap')) return; 

            el.style.setProperty('width', 'auto', 'important');
            el.style.setProperty('min-width', '100%', 'important');

            const width = el.scrollWidth;
            if (width > viewportWidth + 10) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mg-scroll-wrap';
                el.parentNode.insertBefore(wrapper, el);
                wrapper.appendChild(el);
                el.dataset.mgWrapped = '1';

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

    function scheduleOverflowScan() {
        runOverflowScan(); 
        if (document.readyState === 'complete') {
            setTimeout(runOverflowScan, 800); 
        } else {
            window.addEventListener('load', () => {
                runOverflowScan();
                setTimeout(runOverflowScan, 800);
            });
        }
    }
    scheduleOverflowScan();

    window.addEventListener('orientationchange', () => setTimeout(runOverflowScan, 300));
    window.addEventListener('resize', () => {
        clearTimeout(window.__mgResizeTimer);
        window.__mgResizeTimer = setTimeout(runOverflowScan, 300);
    });

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

    try {
        function setupMemo() {
            const statbar = document.getElementById('statbar');
            if (!statbar || document.getElementById('mg-memo-panel')) return;

            const originalTextarea = statbar.querySelector('textarea') ||
                document.querySelector('#statbarMemoCanvas textarea') ||
                document.querySelector('textarea[name="memo"]');
            if (!originalTextarea) return;

            const memoBtn = document.createElement('div');
            memoBtn.className = 'statbarEntry';
            memoBtn.style.cssText = 'cursor:pointer; flex-shrink:0;';
            memoBtn.innerHTML = '📋 Memo';
            const firstEntry = statbar.querySelector('.statbarEntry');
            if (firstEntry) statbar.insertBefore(memoBtn, firstEntry);
            else statbar.insertBefore(memoBtn, statbar.firstChild);

            const panel = document.createElement('div');
            panel.id = 'mg-memo-panel';
            panel.innerHTML = `
                <span class="mg-memo-close">✕</span>
                <div style="font-family:'Cinzel',serif;font-size:11px;color:#b08060;margin-bottom:6px;text-transform:uppercase;">Memo</div>
            `;

            const textarea = originalTextarea.cloneNode(true);
            textarea.style.cssText = '';
            panel.appendChild(textarea);

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.style.cssText = 'margin-top:6px;width:100%;padding:8px;background:#6b1616;color:#ffe4c4;border:1px solid #a02020;border-radius:6px;font-size:13px;cursor:pointer;';
            saveBtn.addEventListener('click', () => {
                originalTextarea.value = textarea.value;
                const form = originalTextarea.closest('form');
                if (form) form.submit();
                else {
                    const formData = new FormData();
                    formData.append(originalTextarea.name || 'memo', textarea.value);
                    fetch(location.href, { method: 'POST', body: formData }).catch(() => {});
                }
            });
            panel.appendChild(saveBtn);
            document.body.appendChild(panel);

            memoBtn.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            });
            panel.querySelector('.mg-memo-close').addEventListener('click', () => {
                panel.style.display = 'none';
            });

            log('memo panel criado');
        }

        setupMemo();
        setTimeout(setupMemo, 1000); 
    } catch (e) { log('erro na seção 8b (memo):', e); }

    try {
        const ACMP_SET_MAX_SLOTS = 5;
        let acmpSlotObserver = null;

        function padActiveSetSlots() {
            const container = document.getElementById('active_set_container');
            if (!container) return;

            if (acmpSlotObserver) acmpSlotObserver.disconnect();

            container.querySelectorAll('.mg-slot-empty').forEach(el => el.remove());
            tagTalentContainers();
            scrubTalentBackgrounds();
            const filled = container.querySelectorAll('.acmp_overview_thumb, img.thumb_acmp').length;
            for (let k = filled; k < ACMP_SET_MAX_SLOTS; k++) {
                const slot = document.createElement('div');
                slot.className = 'mg-slot-empty';
                slot.textContent = '?';
                container.appendChild(slot);
            }

            if (acmpSlotObserver) acmpSlotObserver.observe(container, { childList: true });
        }

        function initAcmpSlotWatcher() {
            const container = document.getElementById('active_set_container');
            if (!container || container.dataset.mgSlotWatch === '1') return false;
            container.dataset.mgSlotWatch = '1';
            tagTalentContainers();
            padActiveSetSlots();
            acmpSlotObserver = new MutationObserver(padActiveSetSlots);
            acmpSlotObserver.observe(container, { childList: true });
            return true;
        }

        function tagTalentContainers() {
            const pills = document.querySelectorAll('.set_select');
            pills.forEach(p => {
                if (p.parentElement) p.parentElement.classList.add('mg-set-grid');
            });
            const setIcons = document.querySelectorAll('#active_set_container img.thumb_acmp, .acmp_overview_thumb');
            setIcons.forEach(ic => {
                const host = ic.classList.contains('acmp_overview_thumb') ? ic.parentElement : ic.parentElement;
                if (host) host.classList.add('mg-active-grid');
            });
            const scope = document.querySelector('.all_acmp_container');
            if (scope) {
                const all = [scope].concat(Array.from(scope.querySelectorAll('*')));
                all.forEach(el => {
                    if (el.tagName === 'IMG') return;
                    if (el.hasAttribute('width')) el.removeAttribute('width');
                    if (el.style && el.style.width && el.style.width.indexOf('%') === -1) {
                        el.style.setProperty('width', 'auto', 'important');
                    }
                    el.style.setProperty('max-width', '100%', 'important');
                    el.style.setProperty('box-sizing', 'border-box', 'important');
                });
            }
        }

        function scrubTalentBackgrounds() {
            const roots = [
                document.getElementById('active_set_container'),
                document.getElementById('active_acmp_container'),
                document.querySelector('.all_acmp_container')
            ].filter(Boolean);
            roots.forEach(root => {
                let node = root;
                for (let up = 0; up < 3 && node; up++) {
                    if (node.tagName !== 'IMG') {
                        node.style.setProperty('background-image', 'none', 'important');
                        node.style.setProperty('height', 'auto', 'important');
                        node.style.setProperty('min-height', '0', 'important');
                        node.style.setProperty('position', 'static', 'important');
                    }
                    node = node.parentElement;
                    if (!node || node.id === 'mg-rebuilt-content' || node === document.body) break;
                }
                root.querySelectorAll('*').forEach(el => {
                    if (el.tagName === 'IMG') return;
                    el.style.setProperty('background-image', 'none', 'important');
                    el.style.setProperty('float', 'none', 'important');
                    el.style.setProperty('position', 'static', 'important');
                });
            });
        }

        if (!initAcmpSlotWatcher()) {
            let acmpSlotAttempts = 0;
            const acmpSlotInterval = setInterval(() => {
                acmpSlotAttempts++;
                if (initAcmpSlotWatcher() || acmpSlotAttempts > 20) clearInterval(acmpSlotInterval);
            }, 250);
        }
    } catch (e) { log('erro na seção 8c-2 (slots vazios de Talentos):', e); }

    try {
        function fixHuntItems() {
            document.querySelectorAll('.mg-card-body').forEach(body => {
                if (body.dataset.mgHuntFixed === '1') return;
                const imgs = Array.from(body.querySelectorAll('img')).filter(im => {
                    const s = (im.src || '');
                    return /item|equip|ring|amulett|weapon|armou?r|shield|helm/i.test(s) ||
                        (im.closest('a') && im.width >= 30 && im.height >= 30);
                });
                if (imgs.length < 2) return;
                const groups = new Map();
                imgs.forEach(im => {
                    const holder = im.closest('a') || im;
                    const parent = holder.parentElement;
                    if (!parent || parent.classList.contains('mg-loot-row')) return;
                    if (!groups.has(parent)) groups.set(parent, []);
                    groups.get(parent).push(holder);
                });
                let touched = false;
                groups.forEach((holders, parent) => {
                    if (holders.length < 2) return;
                    const uniq = Array.from(new Set(holders));
                    const row = document.createElement('div');
                    row.className = 'mg-loot-row';
                    parent.insertBefore(row, uniq[0]);
                    uniq.forEach(h => {
                        let n = row.lastChild;
                        let sib = h.previousSibling;
                        while (sib && (sib.nodeType === 8 || (sib.nodeType === 3 && !sib.textContent.trim()) || sib.tagName === 'BR')) {
                            const rm = sib; sib = sib.previousSibling; rm.remove();
                        }
                        row.appendChild(h);
                        const img = h.tagName === 'IMG' ? h : h.querySelector('img');
                        if (img) {
                            img.removeAttribute('width');
                            img.removeAttribute('height');
                            img.style.setProperty('width', '48px', 'important');
                            img.style.setProperty('height', 'auto', 'important');
                            img.style.setProperty('max-width', '100%', 'important');
                        }
                        h.style.setProperty('display', 'inline-block', 'important');
                    });
                    touched = true;
                });
                if (touched) body.dataset.mgHuntFixed = '1';
            });
        }

    } catch (e) { log('erro na seção 8e (hunt items):', e); }

    try {
        const MG_INTERACTIVE = 'a[href], button, input, select, textarea, option, label, form, [onclick], [onsubmit], [role="button"], [role="link"]';

        function isInteractiveTarget(el) {
            if (!el || !el.closest) return false;
            const inter = el.closest(MG_INTERACTIVE);
            if (!inter) return false;
            if (inter.tagName === 'A') {
                const href = (inter.getAttribute('href') || '').trim();
                return !!(href && href !== '#' && !/^javascript:\s*(void\(0\))?;?$/i.test(href));
            }
            return true;
        }

        function findInfoCarrier(el) {
            if (isInteractiveTarget(el)) return null;
            const carrier = el.closest('[title]');
            if (!carrier) return null;
            if (isInteractiveTarget(carrier)) return null;
            const titleHtml = carrier.getAttribute('title');
            if (!titleHtml || !titleHtml.trim()) return null;
            if (carrier.classList.contains('thumb_acmp')) return null;
            const link = carrier.closest('a[href]');
            if (link) {
                const href = (link.getAttribute('href') || '').trim();
                if (href && href !== '#') return null;
            }
            return titleHtml;
        }

        function showItemInfoPopup(titleHtml) {
            let popup = document.getElementById('mg-info-popup');
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'mg-info-popup';
                popup.innerHTML = '<span class="mg-info-popup-close">✕</span><div class="mg-info-popup-body"></div>';
                document.body.appendChild(popup);
                popup.querySelector('.mg-info-popup-close').addEventListener('click', () => {
                    popup.style.display = 'none';
                });
            }
            popup.querySelector('.mg-info-popup-body').innerHTML = titleHtml;
            popup.style.display = 'block';
        }

        const infoPopupStyle = document.createElement('style');
        infoPopupStyle.textContent = `
            #mg-info-popup {
                display: none;
                position: fixed;
                left: 8px;
                right: 8px;
                bottom: 130px;
                max-height: 55vh;
                overflow-y: auto;
                z-index: 999997;
                background: linear-gradient(180deg, #2a0a0a, #1a0505);
                border: 1px solid #7a1f1f;
                border-radius: 10px;
                padding: 14px 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                font-size: 14px;
                line-height: 1.55;
                color: #e8d8c0;
            }
            #mg-info-popup .mg-info-popup-close {
                position: absolute;
                top: 6px;
                right: 10px;
                color: #b08060;
                font-size: 18px;
                cursor: pointer;
                line-height: 1;
            }
            #mg-info-popup .mg-info-popup-body strong {
                display: block;
                font-family: 'Cinzel', Georgia, serif;
                font-size: 15px;
                color: #f0d9a0;
                margin-bottom: 6px;
                padding-right: 16px;
            }
        `;
        (document.head || document.documentElement).appendChild(infoPopupStyle);

        document.addEventListener('click', function (e) {
            const titleHtml = findInfoCarrier(e.target);
            if (!titleHtml) return;
            e.preventDefault();
            e.stopPropagation();
            showItemInfoPopup(titleHtml);
        }, true);

        log('popup de informação ao toque ativado');
    } catch (e) { log('erro na seção 8f (popup de informação):', e); }

    function repositionToolbarIframe() {
        const iframes = Array.from(document.querySelectorAll('iframe[src*="moonid.net"]'));
        if (iframes.length === 0) return false;

        let repositioned = false;
        iframes.forEach(iframe => {
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

        let toolbarAttempts = 0;
        const toolbarInterval = setInterval(() => {
            toolbarAttempts++;
            if (repositionToolbarIframe() || toolbarAttempts > 30) clearInterval(toolbarInterval);
        }, 300);

        setInterval(repositionToolbarIframe, 500);
        const toolbarObserver = new MutationObserver(() => repositionToolbarIframe());
        toolbarObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } catch (e) { log('erro na seção 9 (reposicionar toolbar):', e); }

    log('shell mobile ativo, largura da tela:', window.innerWidth);

    try {
        function removeSwitchButton() {
            document.querySelectorAll('a, div, p, span').forEach(el => {
                if (el.textContent.trim() === 'Switch to mobile version') {
                    let target = el;
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

    try {
        const TIMER_KEY = 'mg_activity_timer';
        const TIMER_ID = 'mg-activity-timer';

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
            const match = text.match(/dentro de\s+(\d+)\s+(minuto[s]?|hora[s]?)/i);
            if (!match) return null;
            const value = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();
            const seconds = unit.startsWith('hora') ? value * 3600 : value * 60;
            return seconds;
        }

        function scanPageForActivityTimer() {
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

            const savedPos = JSON.parse(localStorage.getItem('mg_timer_pos') || 'null');
            if (savedPos) {
                el.style.left = savedPos.left;
                el.style.bottom = 'auto';
                el.style.top = savedPos.top;
            }

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

        function detectActivityLabel() {
            const bodyText = document.body.innerText.toLowerCase();
            if (/espólio|caça/.test(bodyText)) return '⚔ Raid';
            if (/cemitério|trabalhar|trabalho/.test(bodyText)) return '⛏ Work';
            return '⏳ Active';
        }

        let endsAt = loadTimerEndTime();
        let label = detectActivityLabel();

        if (!endsAt) {
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
