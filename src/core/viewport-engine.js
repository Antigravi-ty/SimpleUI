import { defaultStore } from './store.js';

const storage = {
  get: (k, d) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null) ?? d,
  set: (k, v) => typeof localStorage !== 'undefined' && localStorage.setItem(k, String(v))
};

const mk = (id, label, ratio, insets, width, height) => ({ id, label, ratio, insets, width, height });
export const DEVICE_PRESETS = {
  browser: mk('browser', 'Default', null, { top: 0, right: 0, bottom: 0, left: 0 }),
  'ipad-4-3': mk('ipad-4-3', 'iPad (4:3)', 4/3, { top: 24, right: 0, bottom: 20, left: 0 }, 1024, 768),
  'screen-16-9': mk('screen-16-9', 'Laptop (16:9)', 16/9, { top: 0, right: 0, bottom: 0, left: 0 }, 1920, 1080),
  'screen-18-9': mk('screen-18-9', 'Mobile (18:9)', 18/9, { top: 48, right: 0, bottom: 34, left: 0 }, 1788, 894),
  'ultrawide-21-9': mk('ultrawide-21-9', 'UltraWide (21:9)', 21/9, { top: 0, right: 0, bottom: 0, left: 0 }, 2560, 1080),
  'portrait-warning': mk('portrait-warning', 'Portrait (9:19.5)', 9/19.5, { top: 59, right: 0, bottom: 34, left: 0 }, 393, 852)
};

export const DESIGN_STANDARD_WIDTH = 1280;

export class ViewportEngine {
  constructor() {
    this.activePreset = 'browser';
    this.safeAreaMargin = this.initMargin();
    this.userScale = this.initScale();
    this.safeAreaVisible = storage.get('simpleui-safe-area-visible') === 'true';
    this.portraitDismissed = false;
    this.metrics = this.computeMetrics();
    this.listeners = new Set();
    this.initialized = false;
  }

  initMargin() {
    const s = storage.get('simpleui-safe-area-margin');
    return s !== null ? Math.min(10, Math.max(-5, parseInt(s, 10) || 0)) : 0;
  }

  initScale() {
    const s = storage.get('simpleui-user-scale');
    if (s !== null) return Math.min(200, Math.max(25, parseFloat(s) || 100));
    const z = (typeof window !== 'undefined' && window.visualViewport?.scale) || 1;
    return Math.min(200, Math.max(25, Math.round(z * 100)));
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    this.update();
    window.addEventListener('resize', () => this.update());
    defaultStore.set('viewport_scale', this.metrics.scaleFactor);
    defaultStore.set('user_scale', this.userScale);
    defaultStore.set('safe_area_margin', this.safeAreaMargin);
    defaultStore.set('safe_area_visible', this.safeAreaVisible);
    defaultStore.set('active_preset', this.activePreset);
  }

  setUserScale(val) {
    const clamped = Math.min(200, Math.max(25, Math.round(Number(val))));
    if (clamped === this.userScale) return;
    this.userScale = clamped;
    storage.set('simpleui-user-scale', clamped);
    defaultStore.set('user_scale', clamped);
    this.update();
  }

  setSafeAreaMargin(pct) {
    const clamped = Math.min(10, Math.max(-5, Math.round(Number(pct))));
    if (clamped === this.safeAreaMargin) return;
    this.safeAreaMargin = clamped;
    storage.set('simpleui-safe-area-margin', clamped);
    defaultStore.set('safe_area_margin', clamped);
    this.update();
  }

  setPreset(key) {
    if (!DEVICE_PRESETS[key]) return;
    this.activePreset = key;
    defaultStore.set('active_preset', key);
    this.update();
  }

  toggleSafeArea(force) {
    this.safeAreaVisible = force !== undefined ? force : !this.safeAreaVisible;
    storage.set('simpleui-safe-area-visible', this.safeAreaVisible);
    defaultStore.set('safe_area_visible', this.safeAreaVisible);
    this.renderHUD();
    this.applyCSSVariables();
    this.listeners.forEach(cb => cb(this.metrics));
  }

  computeMetrics() {
    const p = DEVICE_PRESETS[this.activePreset];
    const isSim = p.id !== 'browser';
    const Wwindow = isSim ? p.width : (typeof window !== 'undefined' ? window.innerWidth : 1920);
    const Hwindow = isSim ? p.height : (typeof window !== 'undefined' ? window.innerHeight : 1080);
    const insets = { ...p.insets };

    const marginW = Wwindow * (this.safeAreaMargin / 100);
    const marginH = Hwindow * (this.safeAreaMargin / 100);
    const Wsafe = Math.max(100, Wwindow - insets.left - insets.right - marginW * 2);
    const Hsafe = Math.max(100, Hwindow - insets.top - insets.bottom - marginH * 2);
    const maxRenderW = Hsafe * 2.0;
    const Wrender = Math.min(Wsafe, maxRenderW);
    const Hrender = Hsafe;

    const isPillarboxed = Wsafe > maxRenderW;
    const pillarboxWidth = isPillarboxed ? (Wsafe - Wrender) / 2 : 0;
    const isPortrait = Wsafe < Hsafe;
    const baseScale = Wrender / DESIGN_STANDARD_WIDTH;
    const scaleFactor = Number((baseScale * (this.userScale / 100)).toFixed(3));

    return {
      Wwindow, Hwindow, insets, marginW, marginH, Wsafe, Hsafe, Wrender, Hrender,
      isPillarboxed, pillarboxWidth, isPortrait, baseScale, scaleFactor,
      userScale: this.userScale, safeAreaMargin: this.safeAreaMargin, preset: p
    };
  }

  update() {
    this.metrics = this.computeMetrics();
    this.applyCSSVariables();
    this.renderHUD();
    this.checkPortraitGate();
    defaultStore.set('viewport_scale', this.metrics.scaleFactor);
    defaultStore.set('viewport_metrics', this.metrics);
    this.listeners.forEach(cb => cb(this.metrics));
  }

  subscribe(callback) {
    this.listeners.add(callback);
    if (this.metrics) callback(this.metrics);
    return () => this.listeners.delete(callback);
  }

  applyCSSVariables() {
    if (typeof document === 'undefined') return;
    const m = this.metrics;
    const root = document.documentElement;
    const topInset = Math.round(m.insets.top + m.marginH);
    const bottomInset = Math.round(m.insets.bottom + m.marginH);
    const leftInset = Math.round(m.insets.left + m.marginW);
    const rightInset = Math.round(m.insets.right + m.marginW);

    const props = {
      '--ui-scale': m.scaleFactor,
      '--ui-user-scale': `${m.userScale}%`,
      '--ui-render-width': `${Math.round(m.Wrender)}px`,
      '--ui-render-height': `${Math.round(m.Hrender)}px`,
      '--ui-safe-top': `${topInset}px`,
      '--ui-safe-bottom': `${bottomInset}px`,
      '--ui-safe-left': `${leftInset}px`,
      '--ui-safe-right': `${rightInset}px`,
      '--ui-pillarbox-width': `${Math.round(m.pillarboxWidth)}px`,
      '--ui-unit-1': 'calc(1px * var(--ui-scale))'
    };
    Object.entries(props).forEach(([k, v]) => root.style.setProperty(k, String(v)));

    const shell = document.querySelector('.app-shell');
    if (shell) {
      if (m.isPillarboxed) {
        shell.style.maxWidth = `${m.Wrender}px`;
        shell.style.marginLeft = 'auto';
        shell.style.marginRight = 'auto';
      } else {
        shell.style.maxWidth = '';
        shell.style.marginLeft = leftInset !== 0 ? `${leftInset}px` : '';
        shell.style.marginRight = rightInset !== 0 ? `${rightInset}px` : '';
      }
      shell.style.marginTop = topInset !== 0 ? `${topInset}px` : '';
      shell.style.marginBottom = bottomInset !== 0 ? `${bottomInset}px` : '';
      shell.style.minHeight = (topInset !== 0 || bottomInset !== 0) ? `calc(100vh - ${topInset + bottomInset}px)` : '100vh';
      shell.style.width = (leftInset < 0 || rightInset < 0) ? `calc(100vw - ${leftInset + rightInset}px)` : '';
      shell.style.transition = 'margin 0.15s ease-out, max-width 0.15s ease-out, width 0.15s ease-out';
    }

    const content = document.querySelector('.app-content') || document.querySelector('.app-body');
    if (content) content.style.zoom = m.scaleFactor;
  }

  renderHUD() {
    if (typeof document === 'undefined') return;
    let hud = document.getElementById('ui-safe-area-hud');
    if (!this.safeAreaVisible) {
      if (hud) hud.style.display = 'none';
      return;
    }
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'ui-safe-area-hud';
      hud.className = 'ui-safe-area-hud';
      document.body.appendChild(hud);
    }
    hud.style.display = 'block';

    const m = this.metrics;
    const topInset = m.insets.top + m.marginH;
    const rightInset = m.insets.right + m.marginW;
    const bottomInset = m.insets.bottom + m.marginH;
    const leftInset = m.insets.left + m.marginW;

    let box = hud.querySelector('.ui-safe-area-hud__box');
    let panel = hud.querySelector('.ui-safe-area-hud__panel');

    if (!box || !panel) {
      hud.innerHTML = `
        <div class="ui-safe-area-hud__box"><div class="ui-safe-area-hud__render-zone"></div></div>
        <div class="ui-safe-area-hud__panel" role="dialog" aria-label="Safe Area Controls">
          <div class="ui-safe-area-hud__row ui-safe-area-hud__row--telemetry"><span class="ui-safe-area-hud__telem-text"></span></div>
          <div class="ui-safe-area-hud__row ui-safe-area-hud__row--controls">
            <div class="ui-safe-area-hud__slider-wrap">
              <label for="hud-margin-slider" class="ui-safe-area-hud__label">Safe Area Margin:</label>
              <div class="ui-slider ui-slider--sm ui-slider--neutral ui-safe-area-hud__slider" data-unit="%">
                <input id="hud-margin-slider" type="range" min="-5" max="10" step="1" value="${m.safeAreaMargin}" class="ui-slider__input" aria-label="Safe Area Margin">
                <span class="ui-slider__value" id="hud-margin-val">${m.safeAreaMargin > 0 ? '+' : ''}${m.safeAreaMargin}%</span>
              </div>
            </div>
            <button type="button" id="hud-reset-scale-btn" class="ui-btn ui-btn--sm ui-btn--neutral ui-safe-area-hud__reset-btn">Resize Scale (100%)</button>
          </div>
        </div>`;
      box = hud.querySelector('.ui-safe-area-hud__box');
      panel = hud.querySelector('.ui-safe-area-hud__panel');

      hud.querySelector('#hud-margin-slider')?.addEventListener('input', (e) => {
        this.setSafeAreaMargin(Number(e.target.value));
      });
      hud.querySelector('#hud-reset-scale-btn')?.addEventListener('click', () => {
        this.setUserScale(100);
      });
    }

    box.style.top = `${topInset}px`;
    box.style.right = `${rightInset}px`;
    box.style.bottom = `${bottomInset}px`;
    box.style.left = `${leftInset}px`;

    const rZone = box.querySelector('.ui-safe-area-hud__render-zone');
    if (rZone) rZone.style.maxWidth = `${m.Wrender}px`;

    const telem = hud.querySelector('.ui-safe-area-hud__telem-text');
    if (telem) {
      telem.innerHTML = `<strong>Safe Area (${m.preset.label})</strong>: ${Math.round(m.Wsafe)}×${Math.round(m.Hsafe)}px <span class="ui-safe-area-hud__divider">|</span> <strong>Render (18:9)</strong>: ${Math.round(m.Wrender)}×${Math.round(m.Hrender)}px <span class="ui-safe-area-hud__divider">|</span> <strong>Scale</strong>: ${(m.scaleFactor * 100).toFixed(0)}% (User: ${m.userScale}%) <span class="ui-safe-area-hud__divider">|</span> <strong>Margin</strong>: ${m.safeAreaMargin > 0 ? '+' : ''}${m.safeAreaMargin}%`;
    }

    const slider = hud.querySelector('#hud-margin-slider');
    if (slider && document.activeElement !== slider) slider.value = m.safeAreaMargin;
    const mVal = hud.querySelector('#hud-margin-val');
    if (mVal) mVal.textContent = `${m.safeAreaMargin > 0 ? '+' : ''}${m.safeAreaMargin}%`;
  }

  checkPortraitGate() {
    if (typeof document === 'undefined') return;
    let gate = document.getElementById('ui-portrait-gate');
    if (!this.metrics.isPortrait || this.portraitDismissed) {
      if (gate) gate.style.display = 'none';
      return;
    }
    if (!gate) {
      gate = document.createElement('div');
      gate.id = 'ui-portrait-gate';
      gate.className = 'ui-portrait-gate';
      gate.innerHTML = `<div class="ui-portrait-gate__card"><span class="ui-badge ui-badge--danger ui-badge--sm">Landscape Recommended</span><h2 class="ui-portrait-gate__title">Use it at your own risk</h2><p class="ui-portrait-gate__desc">SimpleUI canvas is engineered for horizontal displays (up to 18:9).</p><div class="ui-portrait-gate__actions"><button type="button" class="ui-btn ui-btn--md ui-btn--danger-subtle ui-portrait-gate__dismiss-btn">I got it</button></div></div>`;
      document.body.appendChild(gate);
      gate.querySelector('.ui-portrait-gate__dismiss-btn').onclick = () => {
        this.portraitDismissed = true;
        gate.style.display = 'none';
      };
    }
    gate.style.display = 'flex';
  }
}

export const viewportEngine = new ViewportEngine();
