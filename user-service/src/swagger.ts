import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';

dotenv.config();

const baseDoc = YAML.load('./docs/base.docs.yaml');
const addressDoc = YAML.load('./docs/address.docs.yaml');
const authDoc = YAML.load('./docs/auth.docs.yaml');
const codeDoc = YAML.load('./docs/code.docs.yaml');
const loyaltyDoc = YAML.load('./docs/loyalty.docs.yaml');
const userDoc = YAML.load('./docs/user.docs.yaml');

baseDoc.paths = {
  ...addressDoc.paths,
  ...authDoc.paths,
  ...codeDoc.paths,
  ...loyaltyDoc.paths,
  ...userDoc.paths,
};

baseDoc.tags = [
  addressDoc.tags,
  authDoc.tags,
  codeDoc.tags,
  loyaltyDoc.tags,
  userDoc.tags,
];

baseDoc.servers = [
  {
    url: `${process.env.APP_URL}/api`,
    description: 'Environment-based server',
  },
];

const swaggerDocument = baseDoc;
export { swaggerUi, swaggerDocument };
