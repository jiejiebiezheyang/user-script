// ==UserScript==
// @name         视频播放器增强覆盖层
// @namespace    video-overlay-enhanced
// @version      2.2.0
// @description  紧凑控件 + 完善全屏切换 + 锁定后支持单击显示控件
// @author       empty cyan
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const CONFIG = {
    longPressDelay: 500,
    speedMultiplier: 2.0,
    horizontalSensitivity: 0.1,
    seekDeadZone: 20,
    verticalSensitivity: 0.5,
    controlsAutoHideDelay: 3000,
    doubleTapThreshold: 400,
    seekStep: 5,
    volumeStep: 0.1,
    brightnessMax: 0.8
  }

  const ICONS = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
    unlock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg>`,
    fullscreen: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    exitFullscreen: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    skipBack: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`,
    skipForward: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>`,
    speed: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>`
  }

  const styles = `
       @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

       .voe-overlay-container {
           position: fixed !important;
           z-index: 2147483646 !important;
           overflow: hidden !important;
           background: #000 !important;
           user-select: none !important;
           -webkit-user-select: none !important;
           touch-action: none !important;
           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
       }

       .voe-overlay-container.voe-fullscreen-fallback {
           position: fixed !important;
           top: 0 !important;
           left: 0 !important;
           width: 100vw !important;
           height: 100vh !important;
           z-index: 2147483647 !important;
       }

       .voe-video {
           width: 100% !important;
           height: 100% !important;
           object-fit: contain !important;
           display: block !important;
       }

       .voe-brightness-overlay {
           position: absolute;
           top: 0; left: 0;
           width: 100%; height: 100%;
           background: #000;
           pointer-events: none;
           opacity: 0;
           transition: opacity 0.08s linear;
           z-index: 10;
       }

       .voe-center-play {
           position: absolute;
           top: 50%; left: 50%;
           transform: translate(-50%, -50%) scale(0.8);
           width: 56px; height: 56px;
           background: rgba(0,0,0,0.5);
           backdrop-filter: blur(10px);
           -webkit-backdrop-filter: blur(10px);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #fff;
           pointer-events: none;
           opacity: 0;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           z-index: 25;
           box-shadow: 0 6px 24px rgba(0,0,0,0.3);
       }
       .voe-center-play svg {
           width: 26px; height: 26px;
           filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));
       }
       .voe-center-play.voe-show {
           opacity: 1;
           transform: translate(-50%, -50%) scale(1);
       }

       .voe-gesture-hint {
           position: absolute;
           top: 16px; left: 50%;
           transform: translate(-50%, 0);
           background: rgba(20, 20, 20, 0.45);
           backdrop-filter: blur(10px);
           -webkit-backdrop-filter: blur(10px);
           color: #fff;
           padding: 8px 16px;
           border-radius: 100px;
           font-size: 13px;
           font-weight: 500;
           letter-spacing: 0.2px;
           pointer-events: none;
           opacity: 0;
           transition: opacity 0.25s ease, transform 0.25s ease;
           z-index: 50;
           white-space: nowrap;
           box-shadow: 0 4px 20px rgba(0,0,0,0.25);
           border: 1px solid rgba(255,255,255,0.08);
           display: flex;
           align-items: center;
           gap: 6px;
       }
       .voe-gesture-hint.voe-show {
           opacity: 1;
           transform: translate(-50%, 0) scale(1);
       }
       .voe-gesture-hint svg {
           width: 16px; height: 16px;
           opacity: 0.9;
       }

       /* 锁定指示器：仅图标、半透明、可点击 */
       .voe-locked-indicator {
           position: absolute;
           top: 14px; right: 14px;
           width: 30px;
           height: 30px;
           background: rgba(20, 20, 20, 0.35);
           backdrop-filter: blur(10px);
           -webkit-backdrop-filter: blur(10px);
           color: rgba(255,255,255,0.55);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           opacity: 0;
           transition: opacity 0.3s ease, background 0.2s, color 0.2s;
           z-index: 25;
           cursor: pointer;
           pointer-events: auto;
           box-shadow: 0 2px 8px rgba(0,0,0,0.15);
           border: 1px solid rgba(255,255,255,0.04);
       }
       .voe-locked-indicator:hover {
           background: rgba(20, 20, 20, 0.6);
           color: rgba(255,255,255,0.9);
       }
       .voe-locked-indicator svg {
           width: 14px; height: 14px;
       }
       .voe-locked-indicator.voe-show {
           opacity: 1;
       }

       .voe-side-indicator {
           position: absolute;
           top: 50%;
           transform: translateY(-50%);
           width: 3px;
           height: 100px;
           background: rgba(255,255,255,0.08);
           border-radius: 3px;
           overflow: hidden;
           opacity: 0;
           transition: opacity 0.2s ease;
           z-index: 25;
           pointer-events: none;
       }
       .voe-side-indicator.voe-show { opacity: 1; }
       .voe-side-indicator .voe-side-fill {
           position: absolute;
           bottom: 0; left: 0;
           width: 100%;
           background: linear-gradient(to top, #ff6b6b, #ff8e8e);
           border-radius: 3px;
           transition: height 0.05s linear;
       }
       .voe-side-indicator-left { left: 18px; }
       .voe-side-indicator-right { right: 18px; }
       .voe-side-icon {
           position: absolute;
           top: -24px; left: 50%;
           transform: translateX(-50%);
           color: rgba(255,255,255,0.8);
           width: 16px; height: 16px;
       }

       .voe-controls {
           position: absolute;
           bottom: 0; left: 0; right: 0;
           background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 75%, transparent 100%);
           padding: 36px 14px 10px;
           display: flex;
           flex-direction: column;
           gap: 6px;
           opacity: 0;
           transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           pointer-events: none;
           z-index: 20;
       }
       .voe-controls.voe-visible {
           opacity: 1;
           pointer-events: auto;
       }

       .voe-controls-row {
           display: flex;
           align-items: center;
           gap: 4px;
           color: #fff;
           font-size: 12px;
           font-weight: 500;
       }

       .voe-btn {
           background: transparent;
           border: none;
           color: rgba(255,255,255,0.9);
           width: 32px;
           height: 32px;
           border-radius: 50%;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
           flex-shrink: 0;
           position: relative;
       }
       .voe-btn svg {
           width: 18px;
           height: 18px;
           filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
       }
       .voe-btn:hover {
           background: rgba(255,255,255,0.1);
           color: #fff;
           transform: scale(1.1);
       }
       .voe-btn:active {
           transform: scale(0.92);
           background: rgba(255,255,255,0.18);
       }
       .voe-btn.voe-active {
           background: rgba(255, 107, 107, 0.18);
           color: #ff6b6b;
       }
       .voe-btn.voe-active:hover {
           background: rgba(255, 107, 107, 0.28);
       }

       .voe-btn-play {
           width: 40px;
           height: 40px;
           background: rgba(255,255,255,0.08);
           backdrop-filter: blur(6px);
           -webkit-backdrop-filter: blur(6px);
           margin-right: 2px;
       }
       .voe-btn-play svg {
           width: 22px;
           height: 22px;
       }
       .voe-btn-play:hover {
           background: rgba(255,255,255,0.16);
       }

       .voe-time {
           font-variant-numeric: tabular-nums;
           min-width: 92px;
           color: rgba(255,255,255,0.85);
           font-size: 12px;
           font-weight: 500;
           letter-spacing: 0.2px;
           text-shadow: 0 1px 3px rgba(0,0,0,0.5);
           margin: 0 4px;
       }
       .voe-time-separator {
           color: rgba(255,255,255,0.35);
           margin: 0 2px;
       }

       .voe-spacer {
           flex: 1;
           min-width: 4px;
       }

       .voe-progress-area {
           position: absolute;
           bottom: 0; left: 0; right: 0;
           height: 16px;
           cursor: pointer;
           z-index: 30;
           display: flex;
           align-items: flex-end;
           padding: 0 0 2px 0;
           transition: padding 0.2s ease;
       }
       .voe-progress-area.voe-thick {
           padding: 0 0 5px 0;
       }

       .voe-progress-track {
           position: relative;
           width: 100%;
           height: 2px;
           background: rgba(255,255,255,0.12);
           border-radius: 2px;
           overflow: visible;
           transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s;
       }
       .voe-progress-area.voe-thick .voe-progress-track {
           height: 4px;
           background: rgba(255,255,255,0.1);
       }

       .voe-progress-buffered {
           position: absolute;
           top: 0; left: 0;
           height: 100%;
           background: rgba(255,255,255,0.15);
           border-radius: 2px;
           width: 0%;
           transition: width 0.3s ease;
       }

       .voe-progress-played {
           position: absolute;
           top: 0; left: 0;
           height: 100%;
           background: linear-gradient(90deg, #ff6b6b 0%, #ff8585 100%);
           border-radius: 2px;
           width: 0%;
           box-shadow: 0 0 6px rgba(255, 107, 107, 0.25);
           transition: width 0.1s linear;
       }

       .voe-progress-thumb {
           position: absolute;
           top: 50%;
           right: -5px;
           width: 10px;
           height: 10px;
           background: #fff;
           border-radius: 50%;
           transform: translateY(-50%) scale(0);
           opacity: 0;
           transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
           box-shadow: 0 1px 6px rgba(0,0,0,0.35), 0 0 0 2.5px rgba(255, 107, 107, 0.2);
           border: 2px solid #ff6b6b;
       }
       .voe-progress-area.voe-thick .voe-progress-thumb {
           transform: translateY(-50%) scale(1);
           opacity: 1;
       }

       .voe-progress-area:hover .voe-progress-track {
           height: 4px;
       }
       .voe-progress-area:hover .voe-progress-thumb {
           transform: translateY(-50%) scale(1);
           opacity: 1;
       }

       .voe-top-bar {
           position: absolute;
           top: 0; left: 0; right: 0;
           padding: 12px 14px 32px;
           background: linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%);
           opacity: 0;
           transition: opacity 0.3s ease;
           pointer-events: none;
           z-index: 20;
           display: flex;
           align-items: center;
           gap: 8px;
       }
       .voe-top-bar.voe-visible {
           opacity: 1;
           pointer-events: auto;
       }
       .voe-top-title {
           color: #fff;
           font-size: 13px;
           font-weight: 600;
           text-shadow: 0 1px 4px rgba(0,0,0,0.5);
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
           flex: 1;
       }

       .voe-speed-badge {
           position: absolute;
           top: 14px; left: 14px;
           background: rgba(255, 107, 107, 0.9);
           color: #fff;
           padding: 4px 10px;
           border-radius: 12px;
           font-size: 11px;
           font-weight: 600;
           opacity: 0;
           transition: opacity 0.2s ease;
           z-index: 25;
           pointer-events: none;
           box-shadow: 0 3px 10px rgba(255, 107, 107, 0.25);
           backdrop-filter: blur(4px);
       }
       .voe-speed-badge.voe-show { opacity: 1; }

       .voe-loading {
           position: absolute;
           top: 50%; left: 50%;
           transform: translate(-50%, -50%);
           width: 36px; height: 36px;
           border: 2.5px solid rgba(255,255,255,0.08);
           border-top-color: #ff6b6b;
           border-radius: 50%;
           animation: voe-spin 0.8s linear infinite;
           z-index: 15;
           opacity: 0;
           transition: opacity 0.3s;
           pointer-events: none;
       }
       .voe-loading.voe-show { opacity: 1; }
       @keyframes voe-spin {
           to { transform: translate(-50%, -50%) rotate(360deg); }
       }
   `

  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  document.head.appendChild(styleEl)

  const formatTime = s => {
    if (!isFinite(s)) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  class VideoOverlay {
    constructor(originalVideo) {
      this.originalVideo = originalVideo
      this.isLocked = false
      this.isControlsVisible = false
      this.controlsHideTimer = null
      this.isDraggingProgress = false
      this.lastTapTime = 0
      this.tapTimer = null
      this.longPressTimer = null
      this.isLongPress = false
      this.touchStartX = 0
      this.touchStartY = 0
      this.touchStartTime = 0
      this.dragDirection = null
      this.startVolume = 0
      this.startBrightness = 0
      this.startCurrentTime = 0
      this.hintTimer = null
      this.syncRaf = null
      this.observers = []
      this.destroyed = false
      this.isFullscreen = false
      this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      this.lastTouchTime = 0

      this.init()
    }

    init() {
      this.createElements()
      this.setupVideo()
      this.setupGestures()
      this.setupProgressBar()
      this.setupKeyboard()
      this.setupSync()
      this.setupFullscreenListener()
      this.bindOriginalEvents()
      this.showGestureHint('播放器已接管', null)
    }

    createElements() {
      this.container = document.createElement('div')
      this.container.className = 'voe-overlay-container'

      this.video = document.createElement('video')
      this.video.className = 'voe-video'
      this.video.playsInline = true
      this.video.preload = 'auto'

      this.brightnessOverlay = document.createElement('div')
      this.brightnessOverlay.className = 'voe-brightness-overlay'

      this.loading = document.createElement('div')
      this.loading.className = 'voe-loading'

      this.centerPlay = document.createElement('div')
      this.centerPlay.className = 'voe-center-play'
      this.centerPlay.innerHTML = ICONS.play

      this.speedBadge = document.createElement('div')
      this.speedBadge.className = 'voe-speed-badge'
      this.speedBadge.textContent = `${CONFIG.speedMultiplier}x`

      this.gestureHint = document.createElement('div')
      this.gestureHint.className = 'voe-gesture-hint'

      // 锁定指示器：仅图标，半透明，可点击解锁
      this.lockedIndicator = document.createElement('div')
      this.lockedIndicator.className = 'voe-locked-indicator'
      this.lockedIndicator.innerHTML = ICONS.lock
      this.lockedIndicator.title = '点击解锁'
      this.lockedIndicator.onclick = e => {
        e.stopPropagation()
        this.toggleLock()
      }

      this.brightnessIndicator = document.createElement('div')
      this.brightnessIndicator.className = 'voe-side-indicator voe-side-indicator-left'
      this.brightnessIndicator.innerHTML = `<div class="voe-side-icon">${ICONS.sun}</div><div class="voe-side-fill" style="height:50%"></div>`

      this.volumeIndicator = document.createElement('div')
      this.volumeIndicator.className = 'voe-side-indicator voe-side-indicator-right'
      this.volumeIndicator.innerHTML = `<div class="voe-side-icon">${ICONS.volume}</div><div class="voe-side-fill" style="height:50%"></div>`

      this.topBar = document.createElement('div')
      this.topBar.className = 'voe-top-bar'
      this.topTitle = document.createElement('div')
      this.topTitle.className = 'voe-top-title'
      this.topTitle.textContent = document.title || '视频播放'
      this.topBar.appendChild(this.topTitle)

      this.controls = document.createElement('div')
      this.controls.className = 'voe-controls'

      this.playBtn = document.createElement('button')
      this.playBtn.className = 'voe-btn voe-btn-play'
      this.playBtn.innerHTML = ICONS.play
      this.playBtn.onclick = () => this.togglePlay()

      this.skipBackBtn = document.createElement('button')
      this.skipBackBtn.className = 'voe-btn'
      this.skipBackBtn.innerHTML = ICONS.skipBack
      this.skipBackBtn.title = '后退 10 秒 (←)'
      this.skipBackBtn.onclick = () => this.seek(-10)

      this.skipForwardBtn = document.createElement('button')
      this.skipForwardBtn.className = 'voe-btn'
      this.skipForwardBtn.innerHTML = ICONS.skipForward
      this.skipForwardBtn.title = '前进 10 秒 (→)'
      this.skipForwardBtn.onclick = () => this.seek(10)

      this.timeDisplay = document.createElement('span')
      this.timeDisplay.className = 'voe-time'
      this.timeDisplay.innerHTML = `<span class="voe-current">0:00</span><span class="voe-time-separator"> / </span><span class="voe-duration">0:00</span>`

      this.spacer = document.createElement('div')
      this.spacer.className = 'voe-spacer'

      this.lockBtn = document.createElement('button')
      this.lockBtn.className = 'voe-btn'
      this.lockBtn.innerHTML = ICONS.unlock
      this.lockBtn.title = '锁定 (L)'
      this.lockBtn.onclick = () => this.toggleLock()

      this.fsBtn = document.createElement('button')
      this.fsBtn.className = 'voe-btn'
      this.fsBtn.innerHTML = ICONS.fullscreen
      this.fsBtn.title = '全屏 (F)'
      this.fsBtn.onclick = () => this.toggleFullscreen()

      this.controlsRow = document.createElement('div')
      this.controlsRow.className = 'voe-controls-row'
      this.controlsRow.append(
        this.playBtn,
        this.skipBackBtn,
        this.skipForwardBtn,
        this.timeDisplay,
        this.spacer,
        this.lockBtn,
        this.fsBtn
      )
      this.controls.appendChild(this.controlsRow)

      this.progressArea = document.createElement('div')
      this.progressArea.className = 'voe-progress-area'
      this.progressTrack = document.createElement('div')
      this.progressTrack.className = 'voe-progress-track'
      this.progressBuffered = document.createElement('div')
      this.progressBuffered.className = 'voe-progress-buffered'
      this.progressPlayed = document.createElement('div')
      this.progressPlayed.className = 'voe-progress-played'
      this.progressThumb = document.createElement('div')
      this.progressThumb.className = 'voe-progress-thumb'
      this.progressPlayed.appendChild(this.progressThumb)
      this.progressTrack.append(this.progressBuffered, this.progressPlayed)
      this.progressArea.appendChild(this.progressTrack)

      this.container.append(
        this.video,
        this.brightnessOverlay,
        this.loading,
        this.centerPlay,
        this.speedBadge,
        this.gestureHint,
        this.lockedIndicator,
        this.brightnessIndicator,
        this.volumeIndicator,
        this.topBar,
        this.controls,
        this.progressArea
      )
      document.body.appendChild(this.container)
    }

    setupVideo() {
      const src = this.originalVideo.currentSrc || this.originalVideo.src
      if (src) {
        this.video.src = src
      } else {
        const sources = this.originalVideo.querySelectorAll('source')
        sources.forEach(s => {
          const ns = document.createElement('source')
          ns.src = s.src
          ns.type = s.type
          this.video.appendChild(ns)
        })
      }

      ;['muted', 'loop', 'playbackRate'].forEach(attr => {
        this.video[attr] = this.originalVideo[attr]
      })

      // 手机端声音跟随系统音量：取消静音并保持元素满音量
      if (this.isMobile) {
        this.video.muted = false
        this.video.volume = 1
      }

      this.originalVideo.muted = true
      this.originalVideo.pause()
      this.originalVideo.style.opacity = '0'
      this.originalVideo.style.pointerEvents = 'none'

      this.video.currentTime = this.originalVideo.currentTime || 0

      this.video.addEventListener('play', () => this.onPlayStateChange())
      this.video.addEventListener('pause', () => this.onPlayStateChange())
      this.video.addEventListener('timeupdate', () => this.updateProgress())
      this.video.addEventListener('progress', () => this.updateBuffered())
      this.video.addEventListener('loadedmetadata', () => this.updateTime())
      this.video.addEventListener('volumechange', () => this.updateVolumeIcon())
      this.video.addEventListener('ended', () => this.onPlayStateChange())
      this.video.addEventListener('click', e => e.stopPropagation())
      this.video.addEventListener('waiting', () => this.loading.classList.add('voe-show'))
      this.video.addEventListener('playing', () => this.loading.classList.remove('voe-show'))
      this.video.addEventListener('canplay', () => this.loading.classList.remove('voe-show'))

      this.video.play().catch(() => {})
    }

    setupGestures() {
      const el = this.container
      el.addEventListener('touchstart', e => this.onTouchStart(e), { passive: false })
      el.addEventListener('touchmove', e => this.onTouchMove(e), { passive: false })
      el.addEventListener('touchend', e => this.onTouchEnd(e), { passive: false })
      el.addEventListener('touchcancel', e => this.onTouchEnd(e), { passive: false })

      el.addEventListener('mousedown', e => this.onMouseDown(e))
      el.addEventListener('mousemove', e => this.onMouseMove(e))
      el.addEventListener('mouseup', e => this.onMouseUp(e))
      el.addEventListener('mouseleave', e => this.onMouseLeave(e))
    }

    // 锁定时仍记录坐标，允许单击显示控件，但禁用手势和长按
    onTouchStart(e) {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      this.touchStartX = t.clientX
      this.touchStartY = t.clientY
      this.touchStartTime = Date.now()
      this.dragDirection = null
      this.isLongPress = false

      if (this.isLocked) return

      this.longPressTimer = setTimeout(() => {
        this.isLongPress = true
        this.video.playbackRate = CONFIG.speedMultiplier
        this.speedBadge.classList.add('voe-show')
        this.showGestureHint(`${CONFIG.speedMultiplier}.0x`, ICONS.speed)
        navigator.vibrate?.(50)
      }, CONFIG.longPressDelay)

      this.startCurrentTime = this.video.currentTime
      this.startVolume = this.video.volume
      this.startBrightness = parseFloat(this.brightnessOverlay.style.opacity) || 0
    }

    onTouchMove(e) {
      if (this.isLocked || this.isLongPress || e.touches.length !== 1) return
      const t = e.touches[0]
      const dx = t.clientX - this.touchStartX
      const dy = t.clientY - this.touchStartY
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)

      if (this.dragDirection) e.preventDefault()

      if (!this.dragDirection && (adx > 10 || ady > 10)) {
        clearTimeout(this.longPressTimer)
        if (adx > ady) {
          this.dragDirection = 'horizontal'
          this.hideControls()
          this.setProgressThick(true)
        } else {
          const screenWidth = window.innerWidth
          this.dragDirection = t.clientX < screenWidth / 2 ? 'vertical-left' : 'vertical-right'
          this.hideControls()
        }
      }

      if (!this.dragDirection) return

      if (this.dragDirection === 'horizontal') {
        const duration = this.video.duration || 0
        if (!duration) return
        // 起始死区：超过阈值后才按位移计算，降低起步灵敏度
        const s = dx < 0 ? -1 : 1
        const mag = Math.abs(dx)
        const effDx = mag > CONFIG.seekDeadZone ? s * (mag - CONFIG.seekDeadZone) : 0
        const seekRatio = (effDx * CONFIG.horizontalSensitivity) / this.container.offsetWidth
        const newTime = Math.max(0, Math.min(duration, this.startCurrentTime + seekRatio * duration))
        this.video.currentTime = newTime
        this.showGestureHint(
          `${formatTime(newTime)} <span style="opacity:0.6">/ ${formatTime(duration)}</span>`,
          null
        )
        this.updateProgress()
      } else if (this.dragDirection === 'vertical-right') {
        const ratio = (-dy * CONFIG.verticalSensitivity) / this.container.offsetHeight
        const newVol = Math.max(0, Math.min(1, this.startVolume + ratio))
        this.video.volume = newVol
        this.video.muted = newVol === 0
        const pct = Math.round(newVol * 100)
        this.showSideIndicator(this.volumeIndicator, newVol)
        this.showGestureHint(`${pct}%`, newVol === 0 ? ICONS.mute : ICONS.volume)
      } else if (this.dragDirection === 'vertical-left') {
        const ratio = (dy * CONFIG.verticalSensitivity) / this.container.offsetHeight
        const newBright = Math.max(0, Math.min(CONFIG.brightnessMax, this.startBrightness + ratio))
        this.brightnessOverlay.style.opacity = newBright
        const pct = Math.round((1 - newBright / CONFIG.brightnessMax) * 100)
        this.showSideIndicator(this.brightnessIndicator, 1 - newBright / CONFIG.brightnessMax)
        this.showGestureHint(`${pct}%`, ICONS.sun)
      }
    }

    onTouchEnd(e) {
      this.lastTouchTime = Date.now()
      clearTimeout(this.longPressTimer)
      if (this.isLongPress) {
        this.isLongPress = false
        this.video.playbackRate = 1.0
        this.speedBadge.classList.remove('voe-show')
        this.hideGestureHint()
        return
      }

      const dt = Date.now() - this.touchStartTime
      const dx = (e.changedTouches[0]?.clientX || 0) - this.touchStartX
      const dy = (e.changedTouches[0]?.clientY || 0) - this.touchStartY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // 单击/双击判定：锁定时也允许单击显示控件
      if (dist < 10 && dt < CONFIG.doubleTapThreshold) {
        const now = Date.now()
        if (now - this.lastTapTime < CONFIG.doubleTapThreshold) {
          clearTimeout(this.tapTimer)
          this.lastTapTime = 0
          this.togglePlay()
        } else {
          this.lastTapTime = now
          this.tapTimer = setTimeout(() => this.toggleControls(), CONFIG.doubleTapThreshold)
        }
      }

      if (this.dragDirection) {
        this.dragDirection = null
        this.hideSideIndicators()
        if (!this.isControlsVisible) this.setProgressThick(false)
        setTimeout(() => this.hideGestureHint(), 500)
      }
    }

    onMouseDown(e) {
      this.touchStartX = e.clientX
      this.touchStartY = e.clientY
      this.touchStartTime = Date.now()
      this.dragDirection = null
      this.isLongPress = false

      if (this.isLocked) return

      this.longPressTimer = setTimeout(() => {
        this.isLongPress = true
        this.video.playbackRate = CONFIG.speedMultiplier
        this.speedBadge.classList.add('voe-show')
      }, CONFIG.longPressDelay)
      this.startCurrentTime = this.video.currentTime
      this.startVolume = this.video.volume
      this.startBrightness = parseFloat(this.brightnessOverlay.style.opacity) || 0
    }

    onMouseMove(e) {
      if (this.isLocked || this.isLongPress || e.buttons !== 1) return
      const dx = e.clientX - this.touchStartX
      const dy = e.clientY - this.touchStartY
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)

      if (!this.dragDirection && (adx > 10 || ady > 10)) {
        clearTimeout(this.longPressTimer)
        if (adx > ady) {
          this.dragDirection = 'horizontal'
          this.hideControls()
          this.setProgressThick(true)
        } else {
          this.dragDirection = e.clientX < window.innerWidth / 2 ? 'vertical-left' : 'vertical-right'
          this.hideControls()
        }
      }

      if (!this.dragDirection) return

      if (this.dragDirection === 'horizontal') {
        const duration = this.video.duration || 0
        if (!duration) return
        const s = dx < 0 ? -1 : 1
        const mag = Math.abs(dx)
        const effDx = mag > CONFIG.seekDeadZone ? s * (mag - CONFIG.seekDeadZone) : 0
        const seekRatio = (effDx * CONFIG.horizontalSensitivity) / this.container.offsetWidth
        const newTime = Math.max(0, Math.min(duration, this.startCurrentTime + seekRatio * duration))
        this.video.currentTime = newTime
        this.updateProgress()
      } else if (this.dragDirection === 'vertical-right') {
        const ratio = (-dy * CONFIG.verticalSensitivity) / this.container.offsetHeight
        this.video.volume = Math.max(0, Math.min(1, this.startVolume + ratio))
        this.showSideIndicator(this.volumeIndicator, this.video.volume)
      } else if (this.dragDirection === 'vertical-left') {
        const ratio = (dy * CONFIG.verticalSensitivity) / this.container.offsetHeight
        const newBright = Math.max(0, Math.min(CONFIG.brightnessMax, this.startBrightness + ratio))
        this.brightnessOverlay.style.opacity = newBright
        this.showSideIndicator(this.brightnessIndicator, 1 - newBright / CONFIG.brightnessMax)
      }
    }

    onMouseUp(e) {
      clearTimeout(this.longPressTimer)
      if (this.isLongPress) {
        this.isLongPress = false
        this.video.playbackRate = 1.0
        this.speedBadge.classList.remove('voe-show')
        return
      }
      if (this.dragDirection) {
        this.dragDirection = null
        this.hideSideIndicators()
        if (!this.isControlsVisible) this.setProgressThick(false)
        return
      }

      // 忽略移动端合成鼠标事件、以及控件本身的点击
      if (Date.now() - this.lastTouchTime < 700) return
      if (e.target.closest && e.target.closest('.voe-btn, .voe-progress-area, .voe-locked-indicator')) return

      const dt = Date.now() - this.touchStartTime
      const dx = e.clientX - this.touchStartX
      const dy = e.clientY - this.touchStartY
      if (Math.sqrt(dx * dx + dy * dy) < 10 && dt < CONFIG.doubleTapThreshold) {
        const now = Date.now()
        if (now - this.lastTapTime < CONFIG.doubleTapThreshold) {
          clearTimeout(this.tapTimer)
          this.lastTapTime = 0
          this.togglePlay()
        } else {
          this.lastTapTime = now
          this.tapTimer = setTimeout(() => this.toggleControls(), CONFIG.doubleTapThreshold)
        }
      }
    }

    onMouseLeave() {
      clearTimeout(this.longPressTimer)
      if (this.isLongPress) {
        this.isLongPress = false
        this.video.playbackRate = 1.0
        this.speedBadge.classList.remove('voe-show')
      }
      if (this.dragDirection) {
        this.dragDirection = null
        this.hideSideIndicators()
        if (!this.isControlsVisible) this.setProgressThick(false)
      }
    }

    showSideIndicator(el, ratio) {
      el.classList.add('voe-show')
      el.querySelector('.voe-side-fill').style.height = Math.max(5, Math.min(100, ratio * 100)) + '%'
    }

    hideSideIndicators() {
      this.brightnessIndicator.classList.remove('voe-show')
      this.volumeIndicator.classList.remove('voe-show')
    }

    setupProgressBar() {
      this.progressArea.addEventListener('click', e => {
        const rect = this.progressTrack.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        const duration = this.video.duration
        if (duration) {
          this.video.currentTime = ratio * duration
          this.updateProgress()
        }
      })

      let isDragging = false
      this.progressArea.addEventListener('mousedown', e => {
        isDragging = true
        this.isDraggingProgress = true
        this.seekToClientX(e.clientX)
      })
      document.addEventListener('mousemove', e => {
        if (isDragging) this.seekToClientX(e.clientX)
      })
      document.addEventListener('mouseup', () => {
        isDragging = false
        this.isDraggingProgress = false
      })

      this.progressArea.addEventListener(
        'touchstart',
        e => {
          this.isDraggingProgress = true
          this.seekToClientX(e.touches[0].clientX)
        },
        { passive: true }
      )
      this.progressArea.addEventListener(
        'touchmove',
        e => {
          if (this.isDraggingProgress) this.seekToClientX(e.touches[0].clientX)
        },
        { passive: true }
      )
      this.progressArea.addEventListener(
        'touchend',
        () => {
          this.isDraggingProgress = false
        },
        { passive: true }
      )
    }

    seekToClientX(clientX) {
      const rect = this.progressTrack.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const duration = this.video.duration
      if (duration) {
        this.video.currentTime = ratio * duration
        this.updateProgress()
      }
    }

    setupKeyboard() {
      document.addEventListener('keydown', e => {
        if (this.destroyed) return
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

        switch (e.key) {
          case ' ':
          case 'k':
            e.preventDefault()
            this.togglePlay()
            break
          case 'ArrowLeft':
            e.preventDefault()
            this.seek(-CONFIG.seekStep)
            break
          case 'ArrowRight':
            e.preventDefault()
            this.seek(CONFIG.seekStep)
            break
          case 'ArrowUp':
            e.preventDefault()
            this.changeVolume(CONFIG.volumeStep)
            break
          case 'ArrowDown':
            e.preventDefault()
            this.changeVolume(-CONFIG.volumeStep)
            break
          case 'f':
            e.preventDefault()
            this.toggleFullscreen()
            break
          case 'l':
            e.preventDefault()
            this.toggleLock()
            break
          case 'm':
            e.preventDefault()
            this.video.muted = !this.video.muted
            this.updateVolumeIcon()
            break
          case 'Escape':
            if (this.isFullscreen && this.container.classList.contains('voe-fullscreen-fallback')) {
              this.exitCssFullscreen()
            }
            break
        }
      })
    }

    setupSync() {
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => this.syncPosition())
        ro.observe(this.originalVideo)
        this.observers.push(ro)
      }
      if (window.IntersectionObserver) {
        const io = new IntersectionObserver(() => this.syncPosition(), { threshold: 0 })
        io.observe(this.originalVideo)
        this.observers.push(io)
      }
      window.addEventListener('scroll', () => this.syncPosition(), { passive: true })
      window.addEventListener('resize', () => this.syncPosition(), { passive: true })

      const poll = () => {
        if (this.destroyed) return
        this.syncPosition()
        requestAnimationFrame(poll)
      }
      this.syncRaf = requestAnimationFrame(poll)
    }

    setupFullscreenListener() {
      const onFsChange = () => {
        const fsEl = document.fullscreenElement
        const isFs = fsEl === this.container || fsEl === this.video || this.container.contains(fsEl)
        this.isFullscreen = isFs || this.container.classList.contains('voe-fullscreen-fallback')
        this.fsBtn.innerHTML = this.isFullscreen ? ICONS.exitFullscreen : ICONS.fullscreen
        this.syncPosition()
      }
      document.addEventListener('fullscreenchange', onFsChange)
      document.addEventListener('webkitfullscreenchange', onFsChange)
      document.addEventListener('mozfullscreenchange', onFsChange)
      document.addEventListener('MSFullscreenChange', onFsChange)
    }

    syncPosition() {
      const rect = this.originalVideo.getBoundingClientRect()
      const style = this.container.style

      if (rect.width === 0 || rect.height === 0 || this.originalVideo.style.display === 'none') {
        style.display = 'none'
        return
      }
      style.display = 'block'

      if (this.container.classList.contains('voe-fullscreen-fallback')) return

      style.left = rect.left + 'px'
      style.top = rect.top + 'px'
      style.width = rect.width + 'px'
      style.height = rect.height + 'px'
    }

    bindOriginalEvents() {
      const attrObserver = new MutationObserver(muts => {
        for (const m of muts) {
          if (m.type === 'attributes') {
            if (m.attributeName === 'src' || m.attributeName === 'currentSrc') {
              const newSrc = this.originalVideo.currentSrc || this.originalVideo.src
              if (newSrc && this.video.src !== newSrc) {
                this.video.src = newSrc
                this.video.play().catch(() => {})
              }
            }
          }
        }
      })
      attrObserver.observe(this.originalVideo, { attributes: true })
      this.observers.push(attrObserver)
    }

    togglePlay() {
      if (this.video.paused) {
        this.video.play().catch(() => {})
      } else {
        this.video.pause()
      }
    }

    onPlayStateChange() {
      const isPlaying = !this.video.paused
      this.playBtn.innerHTML = isPlaying ? ICONS.pause : ICONS.play
      this.centerPlay.innerHTML = isPlaying ? ICONS.pause : ICONS.play

      this.centerPlay.classList.add('voe-show')
      setTimeout(() => this.centerPlay.classList.remove('voe-show'), 600)

      this.updateTime()

      if (isPlaying) {
        this.showControls()
      } else {
        this.showControls(true)
      }
    }

    showControls(persistent = false) {
      this.isControlsVisible = true
      this.controls.classList.add('voe-visible')
      this.topBar.classList.add('voe-visible')
      this.setProgressThick(true)

      clearTimeout(this.controlsHideTimer)

      if (!persistent && !this.video.paused) {
        this.controlsHideTimer = setTimeout(() => this.hideControls(), CONFIG.controlsAutoHideDelay)
      }
    }

    hideControls() {
      this.isControlsVisible = false
      this.controls.classList.remove('voe-visible')
      this.topBar.classList.remove('voe-visible')
      if (!this.isDraggingProgress && !this.dragDirection) {
        this.setProgressThick(false)
      }
    }

    toggleControls() {
      if (this.isControlsVisible) {
        this.hideControls()
      } else {
        this.showControls()
      }
    }

    setProgressThick(thick) {
      this.progressArea.classList.toggle('voe-thick', thick)
    }

    toggleLock() {
      this.isLocked = !this.isLocked
      this.lockBtn.innerHTML = this.isLocked ? ICONS.lock : ICONS.unlock
      this.lockBtn.classList.toggle('voe-active', this.isLocked)
      this.lockedIndicator.classList.toggle('voe-show', this.isLocked)
      this.showGestureHint(
        this.isLocked ? '手势已锁定' : '手势已解锁',
        this.isLocked ? ICONS.lock : ICONS.unlock
      )
    }

    seek(delta) {
      this.video.currentTime = Math.max(0, Math.min(this.video.duration || 0, this.video.currentTime + delta))
      this.updateProgress()
      this.showGestureHint(formatTime(this.video.currentTime), null)
    }

    changeVolume(delta) {
      this.video.volume = Math.max(0, Math.min(1, this.video.volume + delta))
      this.video.muted = this.video.volume === 0
      this.updateVolumeIcon()
      const pct = Math.round(this.video.volume * 100)
      this.showGestureHint(`${pct}%`, this.video.muted ? ICONS.mute : ICONS.volume)
      this.showSideIndicator(this.volumeIndicator, this.video.volume)
      setTimeout(() => this.hideSideIndicators(), 800)
    }

    updateVolumeIcon() {}

    toggleFullscreen() {
      if (this.isFullscreen) {
        this.exitFullscreen()
      } else {
        this.enterFullscreen()
      }
    }

    enterFullscreen() {
      const el = this.container
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => this.enterCssFullscreen())
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen().catch(() => this.enterCssFullscreen())
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen().catch(() => this.enterCssFullscreen())
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen().catch(() => this.enterCssFullscreen())
      } else {
        this.enterCssFullscreen()
      }
    }

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => this.exitCssFullscreen())
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => this.exitCssFullscreen())
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen().catch(() => this.exitCssFullscreen())
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen().catch(() => this.exitCssFullscreen())
      } else {
        this.exitCssFullscreen()
      }
    }

    enterCssFullscreen() {
      this.container.classList.add('voe-fullscreen-fallback')
      this.isFullscreen = true
      this.fsBtn.innerHTML = ICONS.exitFullscreen
      this.syncPosition()
    }

    exitCssFullscreen() {
      this.container.classList.remove('voe-fullscreen-fallback')
      this.isFullscreen = false
      this.fsBtn.innerHTML = ICONS.fullscreen
      this.syncPosition()
    }

    updateProgress() {
      const duration = this.video.duration || 0
      const current = this.video.currentTime || 0
      const ratio = duration ? current / duration : 0
      this.progressPlayed.style.width = ratio * 100 + '%'
      this.updateTime()
    }

    updateBuffered() {
      const duration = this.video.duration || 0
      if (!duration || !this.video.buffered) return
      let end = 0
      for (let i = 0; i < this.video.buffered.length; i++) {
        if (this.video.buffered.start(i) <= this.video.currentTime) {
          end = Math.max(end, this.video.buffered.end(i))
        }
      }
      this.progressBuffered.style.width = (end / duration) * 100 + '%'
    }

    updateTime() {
      const c = this.video.currentTime || 0
      const d = this.video.duration || 0
      const cur = this.timeDisplay.querySelector('.voe-current')
      const dur = this.timeDisplay.querySelector('.voe-duration')
      if (cur) cur.textContent = formatTime(c)
      if (dur) dur.textContent = formatTime(d)
    }

    showGestureHint(text, iconSvg) {
      this.gestureHint.innerHTML = iconSvg ? `${iconSvg}<span>${text}</span>` : `<span>${text}</span>`
      this.gestureHint.classList.add('voe-show')
      clearTimeout(this.hintTimer)
      this.hintTimer = setTimeout(() => this.hideGestureHint(), 1200)
    }

    hideGestureHint() {
      this.gestureHint.classList.remove('voe-show')
    }

    destroy() {
      this.destroyed = true
      clearTimeout(this.controlsHideTimer)
      clearTimeout(this.hintTimer)
      clearTimeout(this.tapTimer)
      clearTimeout(this.longPressTimer)
      cancelAnimationFrame(this.syncRaf)
      this.observers.forEach(o => o.disconnect?.())
      this.container.remove()
      this.originalVideo.style.opacity = ''
      this.originalVideo.style.pointerEvents = ''
      this.originalVideo.removeAttribute('data-voe-initialized')
    }
  }

  let activeOverlay = null

  function findMainVideo() {
    const videos = Array.from(document.querySelectorAll('video'))
    if (videos.length === 0) return null
    let best = null
    let bestScore = 0
    for (const v of videos) {
      const rect = v.getBoundingClientRect()
      const area = rect.width * rect.height
      const visible = rect.width > 100 && rect.height > 100
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (visible && inViewport && area > bestScore) {
        bestScore = area
        best = v
      }
    }
    return best || videos[0]
  }

  function init() {
    const video = findMainVideo()
    if (!video) return
    if (video.dataset.voeInitialized) return
    video.dataset.voeInitialized = 'true'
    if (activeOverlay) activeOverlay.destroy()
    activeOverlay = new VideoOverlay(video)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  const bodyObserver = new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.tagName === 'VIDEO' || (node.querySelector && node.querySelector('video'))) {
          setTimeout(() => {
            const video = findMainVideo()
            if (video && !video.dataset.voeInitialized) {
              if (activeOverlay) activeOverlay.destroy()
              activeOverlay = new VideoOverlay(video)
              video.dataset.voeInitialized = 'true'
            }
          }, 500)
          break
        }
      }
    }
  })
  bodyObserver.observe(document.body, { childList: true, subtree: true })

  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      setTimeout(() => {
        const video = findMainVideo()
        if (video && !video.dataset.voeInitialized) {
          if (activeOverlay) activeOverlay.destroy()
          activeOverlay = new VideoOverlay(video)
          video.dataset.voeInitialized = 'true'
        }
      }, 1000)
    }
  }).observe(document, { subtree: true, childList: true })
})()
