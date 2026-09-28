import { initAppHeader } from './header-nav.js';
import { bindAllBehaviors } from '../src/blocks/index.js';
import { UIRouter } from '../src/navigation/index.js';
import './patterns.css';

// 1. Initialize Unified App Header
initAppHeader({ activePage: 'primitives' });

// 2. Bind behaviors and router
bindAllBehaviors(document.body);
new UIRouter({ root: document.body });
