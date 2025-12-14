import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';

dotenv.config();

const baseDoc = YAML.load('./docs/base.docs.yaml');
const orderDoc = YAML.load('./docs/order.docs.yaml');
const paymentDoc = YAML.load('./docs/payment.docs.yaml');

baseDoc.paths = {
  ...orderDoc.paths,
  ...paymentDoc.paths,
};

baseDoc.tags = [orderDoc.tags, paymentDoc.tags];

baseDoc.servers = [
  {
    url: `${process.env.APP_URL}/api`,
    description: 'Environment-based server',
  },
];

const swaggerDocument = baseDoc;
export { swaggerUi, swaggerDocument };
