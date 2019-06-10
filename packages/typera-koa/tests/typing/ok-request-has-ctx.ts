import * as typera from '../../src'

export const handler: typera.RouteHandler<
  typera.Response.Ok<string>
> = typera.routeHandler()(req => {
  return typera.Response.ok(req.ctx.method)
})
