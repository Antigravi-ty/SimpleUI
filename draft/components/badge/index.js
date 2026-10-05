import schema from './schema.json' with { type: 'json' };
import './styles/index.css';

export { schema as badgeSchema };

export default {
  name: 'badge',
  schema,
  selector: `.${schema.prefix}`
};
