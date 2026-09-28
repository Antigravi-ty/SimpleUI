import schema from './schema.json' with { type: 'json' };
import './styles/index.css';
import { initSlider } from './behavior.js';

export { schema as sliderSchema, initSlider };

export default {
  name: 'slider',
  schema,
  behavior: initSlider,
  selector: `.${schema.prefix}`
};
