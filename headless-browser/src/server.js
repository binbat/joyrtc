import path from 'node:path';

import koa from 'koa';
import serve from 'koa-static';
import proxy from 'koa-proxies';

/**
 * @param {number} port
 */
export function startServer(port) {
  const app = new koa();
  const webroot = path.join(import.meta.dirname, 'webroot');
  const whip = path.resolve(import.meta.dirname, '..', 'node_modules', '@binbat', 'whip-whep', 'whip');
  app.use(serve(webroot));
  app.use(serve(whip));
  app.use(proxy('/whip', (params, ctx) => {
    return {
      target: 'http://localhost:7777',
      changeOrigin: true,
      logs: true
    }
  }));
  app.listen(port, '127.0.0.1');
  console.log(`serving ${webroot} at :${port}`);
  return app;
}
