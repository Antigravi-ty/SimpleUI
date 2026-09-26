import './style.css';
export { default as previewCardSchema } from './schema.json';

export function renderPreviewCard({ id, title, badge, badgeClass = 'ui-badge--neutral', description, stageContent, footerText }) {
  const section = document.createElement('section');
  section.className = 'sp-cata-card';
  if (id) section.id = id;

  const header = document.createElement('div');
  header.className = 'sp-cata-card__header';
  header.innerHTML = `
    <div class="sp-cata-card__title-row">
      <h3 class="sp-cata-card__title">${title || 'Title'}</h3>
      ${badge ? `<span class="ui-badge ${badgeClass} ui-badge--sm">${badge}</span>` : ''}
    </div>
    ${description ? `<p class="sp-cata-card__desc">${description}</p>` : ''}
  `;
  section.appendChild(header);

  const stage = document.createElement('div');
  stage.className = 'sp-cata-stage-well';
  if (typeof stageContent === 'string') {
    stage.innerHTML = stageContent;
  } else if (stageContent instanceof HTMLElement) {
    stage.appendChild(stageContent);
  }
  section.appendChild(stage);

  if (footerText) {
    const footer = document.createElement('div');
    footer.className = 'sp-cata-card__footer';
    footer.innerHTML = `<span>${footerText}</span>`;
    section.appendChild(footer);
  }

  return section;
}
