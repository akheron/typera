import * as http from 'http'
import * as Koa from 'koa'
import * as koaBodyparser from 'koa-bodyparser'

export function makeServer(handler: Koa.Middleware<any, any>): http.Server {
  const app = new Koa()
  app.use(koaBodyparser())
  app.use(handler)
  return app.listen(Math.floor(30000 + Math.random() * 20000))
}
