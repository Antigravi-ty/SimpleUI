import { initAppHeader } from '../showcase/header-nav.js';
import '../showcase/patterns.css';

// 1. Initialize Unified App Header
initAppHeader({ activePage: 'examples' });

// 2. Back navigation
const navigateBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/showcase/components.html';
  }
};

document.getElementById('ref-back-btn')?.addEventListener('click', navigateBack);
document.getElementById('ref-empty-back-btn')?.addEventListener('click', navigateBack);
