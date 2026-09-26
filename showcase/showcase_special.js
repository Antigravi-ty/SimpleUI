import { initAppHeader } from './header-nav.js';
import { bindAllBehaviors } from '../src/blocks/index.js';
import { UIRouter } from '../src/navigation/index.js';

// 1. Initialize Unified App Header with activePage
initAppHeader({ activePage: 'showcase_special' });

// 2. Bind behaviors and Router
bindAllBehaviors(document.body);
new UIRouter({ root: document.body });

// 3. Matrix Appearance Filter handler
const filterInputs = document.querySelectorAll('[data-filter-mod]');
filterInputs.forEach(input => {
  input.addEventListener('change', () => {
    const mod = input.dataset.filterMod;
    const table = document.querySelector('.matrix-table');
    if (!table) return;

    const colMap = { neutral: 1, outline: 2, primary: 3, disabled: 4 };
    const idx = colMap[mod];
    if (idx !== undefined) {
      const th = table.querySelector(`thead th:nth-child(${idx + 1})`);
      if (th) th.style.display = input.checked ? '' : 'none';
      table.querySelectorAll(`tbody tr`).forEach(tr => {
        const td = tr.querySelector(`td:nth-child(${idx + 1})`);
        if (td) td.style.display = input.checked ? '' : 'none';
      });
    }
  });
});
