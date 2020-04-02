import * as typera from 'typera-koa'

export const handler: typera.RouteHandler<typera.Response.Ok<
  string
>> = typera.routeHandler()(req => {
  return typera.Response.ok(req.ctx.method)
})
