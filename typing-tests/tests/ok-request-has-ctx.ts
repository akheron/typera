import * as typera from 'typera-koa'

export const handler: typera.Route<
  typera.Response.Ok<string>
> = typera.route.get('/').handler(req => {
  return typera.Response.ok(req.ctx.method)
})
