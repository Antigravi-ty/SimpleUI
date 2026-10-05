/**
 * Headless Apple 3-Stage Morph Transition Runner
 * Stage 1: Content Fade Out (100ms)
 * Stage 2: Container Dimensions Resize (150ms) using Apple Ease
 * Stage 3: Content Fade In (100ms)
 */

function parseDurationMs(val, fallback) {
  if (!val) return fallback;
  const s = String(val).trim();
  if (s.endsWith('ms')) return parseFloat(s);
  if (s.endsWith('s')) return parseFloat(s) * 1000;
  const n = parseFloat(s);
  return Number.isNaN(n) ? fallback : n;
}

export function executeMorphTransition({
  container,
  content,
  width,
  height,
  onSwitch,
  fadeDuration,
  resizeDuration
}) {
  return new Promise((resolve) => {
    if (!container || !content) {
      if (typeof onSwitch === 'function') onSwitch();
      resolve();
      return;
    }

    const style = window.getComputedStyle(container);
    const fadeMs = fadeDuration ?? parseDurationMs(style.getPropertyValue('--ui-motion-fade-duration'), 100);
    const resizeMs = resizeDuration ?? parseDurationMs(style.getPropertyValue('--ui-motion-resize-duration'), 150);

    // Stage 1: Content Fade Out
    content.classList.add('ui-morph-content--faded');

    setTimeout(() => {
      // Stage 2: Switch DOM view while hidden, then resize container
      if (typeof onSwitch === 'function') {
        onSwitch();
      }

      if (width !== undefined) {
        container.style.width = typeof width === 'number' ? `${width}px` : width;
      }
      if (height !== undefined) {
        container.style.height = typeof height === 'number' ? `${height}px` : height;
      }

      // Stage 3: After container resize completes, Fade In content
      setTimeout(() => {
        content.classList.remove('ui-morph-content--faded');
        resolve();
      }, resizeMs);
    }, fadeMs);
  });
}
