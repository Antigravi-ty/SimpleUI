import schema from './schema.json' with { type: 'json' };
import './styles/index.css';

export { schema as buttonSchema };

export default {
  name: 'button',
  schema,
  selector: `.${schema.prefix}`
};
