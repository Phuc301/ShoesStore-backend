import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';

dotenv.config();

const baseDoc = YAML.load('./docs/base.docs.yaml');
const cartDoc = YAML.load('./docs/cart.docs.yaml');
const cartItemDoc = YAML.load('./docs/cartItem.docs.yaml');

baseDoc.paths = {
  ...cartDoc.paths,
  ...cartItemDoc.paths,
};

baseDoc.tags = [cartDoc.tags, cartItemDoc.tags];

baseDoc.servers = [
  {
    url: `${process.env.APP_URL}/api`,
    description: 'Environment-based server',
  },
];

const swaggerDocument = baseDoc;
export { swaggerUi, swaggerDocument };
