import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';

dotenv.config();

const baseDoc = YAML.load('./docs/base.docs.yaml');
const category = YAML.load('./docs/category.docs.yaml');
const product = YAML.load('./docs/product.docs.yaml');
const review = YAML.load('./docs/review.docs.yaml');

baseDoc.paths = {
  ...category.paths,
  ...product.paths,
  ...review.paths,
};

baseDoc.tags = [category.tags, product.tags, review.tags];

baseDoc.servers = [
  {
    url: `${process.env.APP_URL}/api`,
    description: 'Environment-based server',
  },
];

const swaggerDocument = baseDoc;
export { swaggerUi, swaggerDocument };
