import { initAppHeader } from './header-nav.js';
import { executeMorphTransition } from '/src/core/morph-transition.js';
import { bindAllBehaviors } from '../src/blocks/index.js';

// 1. Initialize Unified App Header
initAppHeader({ activePage: 'animations' });
bindAllBehaviors(document.querySelector('.app-content'));

// 2. Elements & Configurations
const container = document.getElementById('morph-panel');
const content = document.getElementById('morph-content');
const segmentedControl = document.getElementById('anim-size-segmented');
const segmentedButtons = segmentedControl?.querySelectorAll('.ui-segmented-control__item');

const viewCompact = document.getElementById('view-compact');
const viewStandard = document.getElementById('view-standard');
const viewExpanded = document.getElementById('view-expanded');

const fadeRange = document.getElementById('fade-range');
const resizeRange = document.getElementById('resize-range');
const fadeLabel = document.getElementById('fade-val-label');
const resizeLabel = document.getElementById('resize-val-label');

const PRESETS = {
  compact: { width: 280, height: 160, view: viewCompact },
  standard: { width: 420, height: 260, view: viewStandard },
  expanded: { width: 540, height: 340, view: viewExpanded }
};

let currentPreset = 'compact';
let isTransitioning = false;

function updateSegmentedUI(targetKey) {
  segmentedButtons?.forEach(btn => {
    const isTarget = btn.dataset.size === targetKey;
    btn.classList.toggle('ui-segmented-control__item--active', isTarget);
    btn.setAttribute('aria-selected', String(isTarget));
  });
}

async function transitionTo(targetKey) {
  if (isTransitioning || targetKey === currentPreset) return;
  const target = PRESETS[targetKey];
  if (!target) return;

  isTransitioning = true;
  updateSegmentedUI(targetKey);

  const fadeMs = Number(fadeRange?.value) || 100;
  const resizeMs = Number(resizeRange?.value) || 150;

  await executeMorphTransition({
    container,
    content,
    width: target.width,
    height: target.height,
    fadeDuration: fadeMs,
    resizeDuration: resizeMs,
    onSwitch: () => {
      [viewCompact, viewStandard, viewExpanded].forEach(v => v?.classList.add('is-hidden'));
      target.view?.classList.remove('is-hidden');
    }
  });

  currentPreset = targetKey;
  isTransitioning = false;
}

// 3. Segmented Control Clicks
segmentedButtons?.forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    if (size) transitionTo(size);
  });
});

// 4. In-view Next State Action Buttons
document.getElementById('btn-to-standard')?.addEventListener('click', () => transitionTo('standard'));
document.getElementById('btn-to-expanded')?.addEventListener('click', () => transitionTo('expanded'));
document.getElementById('btn-to-compact')?.addEventListener('click', () => transitionTo('compact'));

// 5. Timing Sliders
fadeRange?.addEventListener('input', () => {
  if (fadeLabel) fadeLabel.textContent = `${fadeRange.value}ms`;
});

resizeRange?.addEventListener('input', () => {
  if (resizeLabel) resizeLabel.textContent = `${resizeRange.value}ms`;
});
