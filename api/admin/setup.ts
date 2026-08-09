import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const server = require('../../dist/server.cjs');
const app = server.default || server;

export default function handler(req: any, res: any) {
  return app(req, res);
}


