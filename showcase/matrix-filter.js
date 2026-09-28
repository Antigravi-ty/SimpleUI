export function getModifierCategory(mod) {
  if (mod.endsWith('-subtle')) return 'subtle';
  if (['primary', 'success', 'warning', 'danger'].includes(mod)) return 'filled';
  return 'neutral';
}

export function categorizeModifiers(modifiers) {
  const groups = { all: [...modifiers], neutral: [], filled: [], subtle: [] };
  for (const mod of modifiers) {
    const cat = getModifierCategory(mod);
    groups[cat].push(mod);
  }
  return groups;
}

export function attachMatrixFilter(matrixCard, schema) {
  const modifiers = schema.modifiers || [];
  if (modifiers.length <= 3) return;

  const groups = categorizeModifiers(modifiers);
  const categories = [{ id: 'all', label: 'All', count: groups.all.length }];
  if (groups.neutral.length > 0) categories.push({ id: 'neutral', label: 'Neutral', count: groups.neutral.length });
  if (groups.filled.length > 0) categories.push({ id: 'filled', label: 'Filled', count: groups.filled.length });
  if (groups.subtle.length > 0) categories.push({ id: 'subtle', label: 'Subtle', count: groups.subtle.length });

  if (categories.length <= 2) return;

  const header = matrixCard.querySelector('.matrix-card__header');
  if (!header) return;

  const filterContainer = document.createElement('div');
  filterContainer.className = 'matrix-filter';

  const table = matrixCard.querySelector('.matrix-table');
  const theadThs = Array.from(table.querySelectorAll('thead th')).slice(1);
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  const checkboxMap = new Map();

  function applyFilter() {
    const activeCats = new Set(
      categories.filter(c => c.id !== 'all' && checkboxMap.get(c.id)?.checked).map(c => c.id)
    );

    theadThs.forEach((th, idx) => {
      const mod = modifiers[idx];
      const cat = getModifierCategory(mod);
      const isVisible = activeCats.has(cat);
      th.classList.toggle('matrix-table__col--hidden', !isVisible);
      rows.forEach(tr => {
        const td = tr.querySelectorAll('td')[idx];
        if (td) td.classList.toggle('matrix-table__cell--hidden', !isVisible);
      });
    });
  }

  categories.forEach(cat => {
    const label = document.createElement('label');
    label.className = 'matrix-filter__item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'matrix-filter__checkbox';
    checkbox.checked = true;
    checkbox.value = cat.id;

    checkboxMap.set(cat.id, checkbox);

    checkbox.addEventListener('change', () => {
      if (cat.id === 'all') {
        const checked = checkbox.checked;
        categories.forEach(c => {
          const cb = checkboxMap.get(c.id);
          if (cb) cb.checked = checked;
        });
      } else {
        const specificCats = categories.filter(c => c.id !== 'all');
        const allChecked = specificCats.every(c => checkboxMap.get(c.id)?.checked);
        const allCb = checkboxMap.get('all');
        if (allCb) allCb.checked = allChecked;
      }
      applyFilter();
    });

    label.appendChild(checkbox);
    const span = document.createElement('span');
    span.textContent = cat.label;
    label.appendChild(span);

    const badge = document.createElement('span');
    badge.className = 'matrix-filter__badge';
    badge.textContent = cat.count;
    label.appendChild(badge);

    filterContainer.appendChild(label);
  });

  header.appendChild(filterContainer);
}
