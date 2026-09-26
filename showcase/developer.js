import { initAppHeader } from './header-nav.js';
import { SimpleUIStore } from '../src/core/store.js';
import { viewportEngine } from '../src/core/viewport-engine.js';
import { bindAllBehaviors } from '../src/blocks/index.js';
import { UIRouter } from '../src/navigation/index.js';
import './patterns.css';

// 1. Initialize Unified App Header
initAppHeader({ activePage: 'developer' });

// 2. Initialize Developer Store Demo
const demoStore = new SimpleUIStore({
  'audio.live_volume': 80,
  'audio.commit_volume': 50,
  'system.notifications': true
});

demoStore.initEventDelegation(document.body);

const stateDisplay = document.getElementById('demo-store-state');
const updateStateJson = () => {
  if (stateDisplay) {
    stateDisplay.textContent = JSON.stringify(demoStore.getState(), null, 2);
  }
};

demoStore.subscribeAll(() => {
  updateStateJson();
});
updateStateJson();

// Live slider updates live display
const liveSlider = document.getElementById('slider-live');
liveSlider?.addEventListener('input', (e) => {
  demoStore.set('audio.live_volume', Number(e.target.value));
});

// Commit slider updates only on release (change event)
const commitSlider = document.getElementById('slider-commit');
commitSlider?.addEventListener('change', (e) => {
  demoStore.set('audio.commit_volume', Number(e.target.value));
});

// 3. Virtual Canvas & Safe Area Live Telemetry Subscription
const telemCanvas = document.getElementById('telem-canvas');
const telemSafe = document.getElementById('telem-safe');
const telemRender = document.getElementById('telem-render');
const telemScale = document.getElementById('telem-scale');
const telemMargin = document.getElementById('telem-margin');

viewportEngine.subscribe((m) => {
  if (telemCanvas) telemCanvas.textContent = `${Math.round(m.Wwindow)} × ${Math.round(m.Hwindow)} px`;
  if (telemSafe) telemSafe.textContent = `${Math.round(m.Wsafe)} × ${Math.round(m.Hsafe)} px`;
  if (telemRender) telemRender.textContent = `${Math.round(m.Wrender)} × ${Math.round(m.Hrender)} px`;
  if (telemScale) telemScale.textContent = `${(m.scaleFactor * 100).toFixed(0)}%`;
  if (telemMargin) telemMargin.textContent = `${m.safeAreaMargin > 0 ? '+' : ''}${m.safeAreaMargin}%`;
});

// 4. Router and Behaviors
bindAllBehaviors(document.body);
new UIRouter({ root: document.body });
