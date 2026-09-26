import './style.css';
import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';
import matrixFrameSchema from './schema.json';

export { matrixFrameSchema };

export const DEFAULT_COLUMNS = ['Neutral', 'Outline', 'Primary', 'Success', 'Primary Subtle', 'Success Subtle'];
export const DEFAULT_ROWS = ['Type 1', 'Type 2'];

/**
 * Categorize modifier variants into canonical SimpleUI groups:
 * - Neutral (Grayscale / No saturation: neutral, outline, default)
 * - Filled (Saturated solid colored fill: primary, success, warning, danger)
 * - Subtle (Light tinted translucent/subtle background: primary-subtle, subtle)
 */
export function getModifierCategory(mod) {
  const m = String(mod).toLowerCase().trim();
  if (m.endsWith('-subtle') || m.includes('subtle')) return 'subtle';
  if (['primary', 'success', 'warning', 'danger', 'filled', 'colored'].some(k => m.includes(k))) return 'filled';
  return 'neutral';
}

export function categorizeColumns(columns) {
  const groups = { all: [], neutral: [], filled: [], subtle: [] };
  columns.forEach((col, idx) => {
    const item = { col, idx };
    groups.all.push(item);
    const cat = getModifierCategory(col);
    if (groups[cat]) {
      groups[cat].push(item);
    } else {
      groups.neutral.push(item);
    }
  });

  const categories = [
    { id: 'all', label: 'All', count: groups.all.length, indices: groups.all.map(i => i.idx) }
  ];
  if (groups.neutral.length > 0) {
    categories.push({ id: 'neutral', label: 'Neutral', count: groups.neutral.length, indices: groups.neutral.map(i => i.idx) });
  }
  if (groups.filled.length > 0) {
    categories.push({ id: 'filled', label: 'Filled', count: groups.filled.length, indices: groups.filled.map(i => i.idx) });
  }
  if (groups.subtle.length > 0) {
    categories.push({ id: 'subtle', label: 'Subtle', count: groups.subtle.length, indices: groups.subtle.map(i => i.idx) });
  }
  return { groups, categories };
}

/**
 * renderMatrixFrame - Matrix catalogue staging frame (.draft-sp-cata-matrix-frame).
 * Consumes the 3-stage container pattern without footer.
 * Renders a 2D matrix table with categorized modifier filter bar (All, Neutral, Filled, Subtle)
 * and sticky row header column.
 */
export function renderMatrixFrame(options = {}) {
  const {
    id,
    title = 'Matrix Frame',
    badge = '.draft-sp-cata-matrix-frame',
    status = 'draft',
    badgeClass = status === 'draft' ? 'ui-badge--neutral' : 'ui-badge--primary-subtle',
    description,
    hasRedirectReference = false,
    haveRedirectReference = false,
    redirectLink,
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
    renderCell,
    stageContent,
    className = '',
    attributes = {}
  } = options;

  if (description === undefined || description === null || description === '') {
    throw new Error('[CatalogueSpecialMatrixFrame] "description" is required in frame configuration.');
  }

  // Explicit safety check for description hyperlink
  const isRedirectAllowed = Boolean(hasRedirectReference || haveRedirectReference);
  if (redirectLink !== undefined && redirectLink !== null) {
    if (!isRedirectAllowed) {
      throw new Error(
        '[Frame Conflict] Passing "redirectLink" detected, but "hasRedirectReference" is false or undefined. Did you forget to set hasRedirectReference: true?'
      );
    }
  }

  // 1. Construct Frame Header Node
  const headerNode = document.createElement('div');
  headerNode.className = 'sp-cata-frame__header';

  const leftCol = document.createElement('div');
  leftCol.className = 'sp-cata-frame__header-left';

  const titleRow = document.createElement('div');
  titleRow.className = 'sp-cata-frame__title-row';

  const titleEl = document.createElement('h3');
  titleEl.className = 'sp-cata-frame__title';
  titleEl.textContent = title;
  titleRow.appendChild(titleEl);

  if (badge) {
    const badgeEl = document.createElement('span');
    badgeEl.className = `ui-badge ${badgeClass} ui-badge--sm`;
    badgeEl.textContent = badge;
    titleRow.appendChild(badgeEl);
  }
  leftCol.appendChild(titleRow);

  const descEl = document.createElement('p');
  descEl.className = 'sp-cata-frame__desc';
  descEl.textContent = description;
  leftCol.appendChild(descEl);

  // Render Description Hyperlink if permitted
  if (isRedirectAllowed && redirectLink) {
    const redirectP = document.createElement('p');
    redirectP.className = 'sp-cata-frame__redirect';

    const toSee = redirectLink.toSee || '';
    const checkText = redirectLink.checkText || redirectLink.linkText || 'documentation';
    const targetUrl = redirectLink.url || '#';
    const prefixText = toSee ? `To see ${toSee}, check ` : (redirectLink.prefixText || '');

    redirectP.innerHTML = `${prefixText}<a href="${targetUrl}" class="sp-cata-frame__redirect-link">${checkText} ↗</a>`;

    const aEl = redirectP.querySelector('a');
    if (aEl && targetUrl.startsWith('#')) {
      aEl.addEventListener('click', (e) => {
        const rawTarget = targetUrl.replace(/^#/, '');
        const target = document.getElementById(rawTarget) || document.querySelector(targetUrl);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', targetUrl);
        }
      });
    }
    leftCol.appendChild(redirectP);
  }

  headerNode.appendChild(leftCol);

  // 2. Construct Matrix Content Node (Categorized Filter Bar + 2D Table with fixed row headers)
  const contentNode = document.createElement('div');
  contentNode.className = 'draft-sp-cata-matrix-frame__body';

  if (stageContent instanceof HTMLElement) {
    contentNode.appendChild(stageContent);
  } else if (typeof stageContent === 'string') {
    contentNode.innerHTML = stageContent;
  } else {
    // Default: Construct Categorized Matrix Table & Interactive Appearance Filter Bar
    const { categories } = categorizeColumns(columns);

    const filterBar = document.createElement('div');
    filterBar.className = 'draft-sp-cata-matrix-frame__filter-bar';
    filterBar.innerHTML = `<span class="draft-sp-cata-matrix-frame__filter-label">Appearance:</span>`;

    const filterGroup = document.createElement('div');
    filterGroup.className = 'draft-sp-cata-matrix-frame__filter-group';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'draft-sp-cata-matrix-frame__table-wrapper';

    const table = document.createElement('table');
    table.className = 'draft-sp-cata-matrix-frame__table';

    // Build Table thead (Type \ Modifier pinned to left)
    let theadHtml = `<thead><tr><th class="draft-sp-cata-matrix-frame__row-header">Type \\ Modifier</th>`;
    columns.forEach((col, idx) => {
      theadHtml += `<th class="draft-sp-cata-matrix-frame__col-header" data-col-idx="${idx}"><span>${col}</span></th>`;
    });
    theadHtml += `</tr></thead>`;

    // Build Table tbody
    let tbodyHtml = `<tbody>`;
    rows.forEach(row => {
      tbodyHtml += `<tr><td class="draft-sp-cata-matrix-frame__row-header"><strong>${row}</strong></td>`;
      columns.forEach((col, idx) => {
        const customCell = typeof renderCell === 'function' ? renderCell(row, col, idx) : null;
        const innerContent = customCell !== null
          ? customCell
          : `<div class="draft-sp-cata-matrix-frame__slot-placeholder">[${row} × ${col}]</div>`;

        tbodyHtml += `<td class="draft-sp-cata-matrix-frame__cell" data-col-idx="${idx}">${innerContent}</td>`;
      });
      tbodyHtml += `</tr>`;
    });
    tbodyHtml += `</tbody>`;

    table.innerHTML = theadHtml + tbodyHtml;
    tableWrapper.appendChild(table);

    // Checkbox Map for multi-category filter coordination
    const checkboxMap = new Map();
    const labelMap = new Map();

    const updateVisibility = () => {
      const activeIndices = new Set();
      categories.forEach(cat => {
        if (cat.id !== 'all' && checkboxMap.get(cat.id)?.checked) {
          cat.indices.forEach(idx => activeIndices.add(idx));
        }
      });

      columns.forEach((_, idx) => {
        const isVisible = activeIndices.has(idx);
        table.querySelectorAll(`[data-col-idx="${idx}"]`).forEach(cell => {
          cell.classList.toggle('draft-sp-cata-matrix-frame__col--hidden', !isVisible);
          cell.classList.toggle('draft-sp-cata-matrix-frame__cell--hidden', !isVisible);
        });
      });
    };

    categories.forEach(cat => {
      const label = document.createElement('label');
      label.className = 'ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked draft-sp-cata-matrix-frame__filter-item';
      label.style.userSelect = 'none';
      label.innerHTML = `
        <input type="checkbox" class="ui-checkbox__input" checked value="${cat.id}" />
        <span class="ui-checkbox__box"><svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span>
        <span class="ui-checkbox__label">${cat.label}</span>
        <span class="draft-sp-cata-matrix-frame__filter-count">${cat.count}</span>
      `;

      const input = label.querySelector('input');
      checkboxMap.set(cat.id, input);
      labelMap.set(cat.id, label);

      input.addEventListener('change', () => {
        if (cat.id === 'all') {
          const isChecked = input.checked;
          categories.forEach(c => {
            const cb = checkboxMap.get(c.id);
            const lb = labelMap.get(c.id);
            if (cb) cb.checked = isChecked;
            if (lb) lb.classList.toggle('ui-checkbox--checked', isChecked);
          });
        } else {
          label.classList.toggle('ui-checkbox--checked', input.checked);
          const specific = categories.filter(c => c.id !== 'all');
          const allChecked = specific.every(c => checkboxMap.get(c.id)?.checked);
          const allCb = checkboxMap.get('all');
          const allLb = labelMap.get('all');
          if (allCb) allCb.checked = allChecked;
          if (allLb) allLb.classList.toggle('ui-checkbox--checked', allChecked);
        }
        updateVisibility();
      });

      filterGroup.appendChild(label);
    });

    filterBar.appendChild(filterGroup);
    contentNode.appendChild(filterBar);
    contentNode.appendChild(tableWrapper);
  }

  // 3. Delegate to Three-Stage Container Structural Pattern WITHOUT FOOTER
  return renderThreeStageContainer({
    id,
    className: `draft-sp-cata-matrix-frame sp-cata-frame ${className}`.trim(),
    attributes,
    header: headerNode,
    content: contentNode,
    footer: null // Strictly NO footer for Matrix Frame
  });
}
