import * as http from 'http'
import * as Koa from 'koa'
import * as koaBodyparser from 'koa-bodyparser'
import * as koaRouter from 'koa-router'

export function makeServer(router: koaRouter): http.Server {
  const app = new Koa()
  app.use(koaBodyparser())
  app.use(router.routes())
  return app.listen(53823)
}
