import { basicTransitionSchema, executeMorphTransition } from './basic-transition/index.js';
import { livePreviewSchema, initLivePreview } from './live-preview/index.js';

export {
  basicTransitionSchema,
  livePreviewSchema,
  executeMorphTransition,
  initLivePreview
};

export const animations = {
  'basic-transition': basicTransitionSchema,
  'live-preview': livePreviewSchema
};

export default animations;
