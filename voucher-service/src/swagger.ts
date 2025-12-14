import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';

dotenv.config();

const baseDoc = YAML.load('./docs/base.docs.yaml');
const voucher = YAML.load('./docs/voucher.docs.yaml');

baseDoc.paths = {
  ...voucher.paths,
};

baseDoc.tags = [voucher.tags];

baseDoc.servers = [
  {
    url: `${process.env.APP_URL}/api`,
    description: 'Environment-based server',
  },
];

const swaggerDocument = baseDoc;
export { swaggerUi, swaggerDocument };
