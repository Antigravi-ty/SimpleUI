/**
 * GliderEngine - Fluid Sliding Indicator Physics Runner.
 *
 * Orchestrates Apple-style smooth position & elastic width morphing for
 * segmented controls, tabs, and switch bars with zero business data perception.
 */
export class GliderEngine {
  /**
   * @param {HTMLElement} container - Segmented control or tablist element
   * @param {object} [options={}]
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.gliderClass = options.gliderClass || 'ui-segmented-control__glider';
    this.activeSelector = options.activeSelector || '.ui-segmented-control__item--active, [aria-selected="true"]';
    this.glider = null;
    this.resizeObserver = null;
    this.init();
  }

  init() {
    if (!this.container) return;

    // Ensure container has relative positioning
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    this.glider = this.container.querySelector(`.${this.gliderClass}`);
    if (!this.glider) {
      this.glider = document.createElement('div');
      this.glider.className = this.gliderClass;
      this.glider.setAttribute('aria-hidden', 'true');
      this.container.prepend(this.glider);
    }

    this.update(false);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.update(false);
      });
      this.resizeObserver.observe(this.container);
    }
  }

  /**
   * Update glider position and dimension to match the active item.
   * @param {boolean} [animated=true]
   */
  update(animated = true) {
    if (!this.container || !this.glider) return;

    const activeItem = this.container.querySelector(this.activeSelector);
    if (!activeItem) {
      this.glider.style.opacity = '0';
      return;
    }

    this.glider.style.opacity = '1';
    const left = activeItem.offsetLeft;
    const width = activeItem.offsetWidth;

    if (!animated) {
      this.glider.style.transition = 'none';
      this.glider.style.transform = `translateX(${left}px)`;
      this.glider.style.width = `${width}px`;
      void this.glider.offsetHeight; // Force reflow
      this.glider.style.transition = '';
    } else {
      this.glider.style.transform = `translateX(${left}px)`;
      this.glider.style.width = `${width}px`;
    }
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.glider) {
      this.glider.remove();
      this.glider = null;
    }
  }
}

export function attachGlider(container, options = {}) {
  return new GliderEngine(container, options);
}
